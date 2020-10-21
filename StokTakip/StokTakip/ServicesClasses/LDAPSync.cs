using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Novell.Directory.Ldap;
using Novell.Directory.Ldap.Controls;
using StokTakip.Helpers;
using StokTakipBackend.DatabaseClasses;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;

namespace StokTakip.ServicesClasses
{
    public class LDAPSync : IHostedService, IDisposable
    {
        private AppSettings appSettings;
        private Timer timer;
        IConfiguration config;

        public LDAPSync(IConfiguration config)
        {
            this.config = config;
            appSettings = config.GetSection("AppSettings").Get<AppSettings>();
        }
        public Task StartAsync(CancellationToken cancellationToken)
        {
            timer = new Timer(SaveAllUser, null, 0, Timeout.Infinite);
            return Task.CompletedTask;
        }
        public Task StopAsync(CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
        public void SaveAllUser(object state)
        {
            try
            {
                var ldapConnection = new LdapConnection();
                ldapConnection.SearchConstraints.ReferralFollowing = true;
                ldapConnection.Connect(appSettings.LDAPParams.adHost, LdapConnection.DEFAULT_PORT);

                using (var db = new StockTrackingDbContext(new DbContextOptionsBuilder().UseSqlServer(config.GetConnectionString("StockTracking")).Options))
                {
                    var maxUpdated = db.users.Any() ? db.users.Max(r => r.lastUpdate) : DateTime.Now.AddYears(-10);
                    ldapConnection.Bind(LdapConnection.Ldap_V3, $@"{appSettings.LDAPParams.adDomain}\{appSettings.LDAPParams.adAdmin.Split("@").First()}", appSettings.LDAPParams.adPassword);
                    string filter = $"(&(objectClass=user)(objectClass=person)(!(whenChanged<={maxUpdated.ToString("yyyyMMddHHmmss.f'Z'", CultureInfo.InvariantCulture)})))";
                    var pageSize = 1000;
                    var pageNo = 1;
                    var resultCount = 0;
                    do try
                        {
                            var searchConstraints = new LdapSearchConstraints();
                            searchConstraints.setControls(new LdapControl[] {
                        new LdapSortControl(new LdapSortKey("cn"), true),
                        new LdapVirtualListControl((pageNo - 1) * pageSize + 1, 0, pageSize - 1, 0)
                    });
                            var searchResult = ldapConnection.Search(appSettings.LDAPParams.@base, LdapConnection.SCOPE_SUB, filter, null, false, searchConstraints);
                            resultCount = 0;
                            while (searchResult.HasMore())
                            {
                                resultCount++;
                                LdapEntry r;
                                user user;
                                try
                                {
                                    r = searchResult.Next();
                                    user = new user
                                    {
                                        objectSid = r.getAttribute("objectSid") != null ? new SecurityIdentifier((byte[])(Array)r.getAttribute("objectSid").ByteValue, 0).ToString() : null,
                                        accountName = r.getAttribute("sAMAccountName").StringValue,
                                        firstName = r.getAttribute("givenName") != null ? r.getAttribute("givenName").StringValue.ToCamelCase() : null,
                                        lastName = r.getAttribute("sn") != null ? r.getAttribute("sn").StringValue.ToUpper(CultureInfo.GetCultureInfo("tr-TR")) : null,
                                        displayName = r.getAttribute("displayName") != null ? r.getAttribute("displayName").StringValue : null,
                                        memberOf = r.getAttribute("memberOf") != null ? r.getAttribute("memberOf").StringValueArray.ToList() : null,
                                        userPrincipalName = r.getAttribute("userPrincipalName") != null ? r.getAttribute("userPrincipalName").StringValue.ToLowerInvariant() : null,
                                        mobile = r.getAttribute("mobile") != null ? r.getAttribute("mobile").StringValue : null,
                                        ipPhone = r.getAttribute("ipPhone") != null ? r.getAttribute("ipPhone").StringValue : null,
                                        telephoneNumber = r.getAttribute("telephoneNumber") != null ? r.getAttribute("telephoneNumber").StringValue : null,
                                        city = r.getAttribute("l") != null ? r.getAttribute("l").StringValue.ToCamelCase() : null,
                                        semt = r.getAttribute("st") != null ? r.getAttribute("st").StringValue.ToCamelCase() : null,
                                        email = r.getAttribute("mail") != null ? r.getAttribute("mail").StringValue.ToLowerInvariant().ToLowerInvariant() : null,
                                        company = r.getAttribute("company") != null ? r.getAttribute("company").StringValue.ToCamelCase() : null,
                                        department = r.getAttribute("department") != null ? r.getAttribute("department").StringValue.ToCamelCase() : null,
                                        title = r.getAttribute("title") != null ? r.getAttribute("title").StringValue.ToCamelCase() : null,
                                        streetAddress = r.getAttribute("streetAddress") != null ? r.getAttribute("streetAddress").StringValue.ToCamelCase() : null,
                                        wWWHomePage = r.getAttribute("wWWHomePage") != null ? r.getAttribute("wWWHomePage").StringValue.ToLowerInvariant() : null,
                                        postalCode = r.getAttribute("postalCode") != null ? r.getAttribute("postalCode").StringValue : null,
                                        thumbnailPhoto = r.getAttribute("thumbnailPhoto") != null ? Convert.ToBase64String((byte[])(Array)r.getAttribute("thumbnailPhoto").ByteValue) : null,
                                        editedBy = r.getAttribute("objectSid") != null ? new SecurityIdentifier((byte[])(Array)r.getAttribute("objectSid").ByteValue, 0).ToString() : string.Empty,
                                        deleted = false,
                                        lastUpdate = DateTime.ParseExact(r.getAttribute("whenChanged").StringValue, "yyyyMMddHHmmss.f'Z'", CultureInfo.InvariantCulture),
                                        tckn = r.getAttribute("tc") != null ? r.getAttribute("tc").StringValue : null

                                    };
                                    var userEntry = db.Entry(user);
                                    db.Attach(user);
                                    var originalRow = db.users.AsNoTracking().SingleOrDefault(r => r.objectSid == user.objectSid);

                                    userEntry.State = originalRow == null ? EntityState.Added : EntityState.Modified;

                                    db.SaveChanges();

                                    var isCompany = db.companies.SingleOrDefault(r => r.name == user.company);

                                    if (isCompany != null)
                                    {
                                        var companyUser = db.companyUsers.SingleOrDefault(r => r.userId == user.objectSid && r.companyId == isCompany.id);

                                        if (companyUser == null)
                                        {
                                            companyUser = new companyUser
                                            {
                                                companyId = (Guid)isCompany.id,
                                                createdBy = user.createdBy,
                                                createdDate = DateTime.Now,
                                                deleted = false,
                                                editedBy = user.editedBy,
                                                lastUpdate = DateTime.Now,
                                                userId = user.objectSid
                                            };

                                            db.Entry(companyUser).State = EntityState.Added;
                                        }
                                        else
                                        {
                                            companyUser.userId = user.objectSid;
                                            companyUser.lastUpdate = DateTime.Now;
                                            companyUser.editedBy = user.editedBy;
                                            companyUser.deleted = false;
                                            companyUser.createdDate = user.createdDate;
                                            companyUser.createdBy = user.createdBy;
                                            companyUser.companyId = (Guid)isCompany.id;
                                            db.Entry(user).State = EntityState.Modified;
                                        }
                                        db.SaveChanges();
                                    }
                                }
                                catch (LdapReferralException e)
                                {
                                    var uris = e.getReferrals();
                                }
                                catch (Exception e)
                                {

                                }
                            }
                            pageNo++;
                        }
                        catch (Exception e)
                        {
                        } while (resultCount >= pageSize);
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            timer.Change(5000, Timeout.Infinite);
        }
        public void Dispose()
        {
            timer?.Dispose();
        }
    }
}
