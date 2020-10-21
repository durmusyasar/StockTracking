using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Novell.Directory.Ldap;
using StokTakip.Helpers;
using StokTakipBackend.DatabaseClasses;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace StokTakip.ServicesClasses
{
    public class AuthenticationService: IDisposable
    {
        private LdapConnection ldapConnection;
        private AppSettings appSettings;
        private IHttpContextAccessor httpContextAccessor;
        private StockTrackingDbContext dbContext;

        private UserClaims _userClaims;

        public UserClaims UserClaims
        {
            get
            {
                if (_userClaims == null)
                {
                    if (httpContextAccessor.HttpContext.User == null) return new UserClaims
                    {
                        objectSID = ""
                    };
                    var User = httpContextAccessor.HttpContext.User;
                    var objectSid = User.HasClaim(r => r.Type == ClaimTypes.NameIdentifier) ? User.FindFirstValue(ClaimTypes.NameIdentifier) : null;
                    var userPrivileges = dbContext.users.Where(r => r.objectSid == objectSid).ToList();
                    _userClaims = _userClaims ?? new UserClaims
                    {
                        objectSID = objectSid,
                    };
                }
                return _userClaims;
            }
        }

        public AuthenticationService(IOptions<AppSettings> appSettingsOptions, StockTrackingDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            appSettings = appSettingsOptions.Value;
            ldapConnection = new LdapConnection();
            ldapConnection.SearchConstraints.ReferralFollowing = true;
            ldapConnection.Connect(appSettings.LDAPParams.adHost, LdapConnection.DEFAULT_PORT);
            this.dbContext = dbContext;
            this.httpContextAccessor = httpContextAccessor;
        }

        public Task<IEnumerable<user>> GetUserInfo(string userName, string password)
        {
            return Task.Run(async () =>
            {
                var entries = new List<LdapEntry>();
                try
                {
                    ldapConnection.Bind(LdapConnection.Ldap_V3, $@"{appSettings.LDAPParams.adDomain}\{userName.Split("@").First()}", password);
                    string filter = $"(&(objectClass=user)(objectClass=person)(sAMAccountName={userName.Split("@").First()}))";
                    var searchResult = ldapConnection.Search(appSettings.LDAPParams.@base, LdapConnection.SCOPE_SUB, filter, null, false);

                    while (searchResult.HasMore())
                    {
                        LdapEntry entry;
                        try
                        {
                            entry = searchResult.Next();
                            entries.Add(entry);
                        }
                        catch (LdapReferralException e)
                        {
                            var uris = e.getReferrals();
                        }
                    }
                }
                catch (Exception e)
                {
                    throw e;
                }
                finally
                {
                }
                var results = entries.Select(r => new user
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
                    tckn = r.getAttribute("tc") != null ? r.getAttribute("tc").StringValue : null
                }).ToList();
                return results.AsEnumerable();
            });
        }

        public async Task<bool> ValidateUser(string userName, string password)
        {
            try
            {
                await Task.Run(() =>
                {
                    ldapConnection.Bind(LdapConnection.Ldap_V3, $@"{appSettings.LDAPParams.adDomain}\{userName}", password);
                });
                return true;
            }
            #pragma warning disable CS0168 // Variable is declared but never used
            catch (Exception e)
            #pragma warning restore CS0168 // Variable is declared but never used
            {
                return false;
            }
        }

        public async Task<IEnumerable<object>> GetGroups()
        {
            return await Task.Run(() =>
            {
                var entries = new List<LdapEntry>();
                try
                {
                    ldapConnection.Bind(LdapConnection.Ldap_V3, $@"{appSettings.LDAPParams.adDomain}\{appSettings.LDAPParams.adAdmin.Split("@").First()}", appSettings.LDAPParams.adPassword);
                    string filter = "(objectClass=group)";
                    var searchResult = ldapConnection.Search(appSettings.LDAPParams.@base, LdapConnection.SCOPE_SUB, filter, null, false);
                    while (searchResult.HasMore())
                    {
                        try
                        {
                            entries.Add(searchResult.Next());
                        }
                        catch (LdapReferralException e)
                        {
                        }
                    }
                }
                finally
                {
                }
                return entries.Select(r => new
                {
                    r.DN,
                    objectGUID = new Guid((byte[])(Array)r.getAttribute("objectGUID").ByteValue),
                    objectSid = new SecurityIdentifier((byte[])(Array)r.getAttribute("objectSid").ByteValue, 0).ToString(),
                    attributes = r.getAttributeSet().ToArray().Select(rr => new
                    {
                        @type = ((LdapAttribute)rr).Name,
                        value = ((LdapAttribute)rr).StringValueArray
                    })
                });
            });
        }

        public Task<string> GetGroupSid(string groupDn)
        {
            return Task.Run(() =>
            {
                var entries = new List<LdapEntry>();
                try
                {
                    ldapConnection.Bind(LdapConnection.Ldap_V3, $@"{appSettings.LDAPParams.adDomain}\{appSettings.LDAPParams.adAdmin.Split("@").First()}", appSettings.LDAPParams.adPassword);
                    string filter = $"(distinguishedName={groupDn})";
                    var searchResult = ldapConnection.Search(appSettings.LDAPParams.@base, LdapConnection.SCOPE_SUB, filter, null, false);
                    while (searchResult.HasMore())
                    {
                        try
                        {
                            entries.Add(searchResult.Next());
                        }
                        catch (LdapReferralException e)
                        {
                            var u = e.getReferrals();
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                }

                return entries.Any() ? entries.Select(r => new
                {
                    objectSid = r.getAttribute("objectSid") != null ? new SecurityIdentifier((byte[])(Array)r.getAttribute("objectSid").ByteValue, 0).ToString() : null,
                }).First().objectSid : null;
            });
        }

        public Task<string> GetGroupDistinguishedName(string groupDn)
        {
            return Task.Run(() =>
            {
                var entries = new List<LdapEntry>();
                try
                {
                    ldapConnection.Bind(LdapConnection.Ldap_V3, $@"{appSettings.LDAPParams.adDomain}\{appSettings.LDAPParams.adAdmin.Split("@").First()}", appSettings.LDAPParams.adPassword);
                    string filter = $"(objectSid={groupDn})";
                    var searchResult = ldapConnection.Search(appSettings.LDAPParams.@base, LdapConnection.SCOPE_SUB, filter, null, false);
                    while (searchResult.HasMore())
                    {
                        try
                        {
                            entries.Add(searchResult.Next());
                        }
                        catch (LdapReferralException e)
                        {
                            var u = e.getReferrals();
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                }

                return entries.Any() ? entries.Select(r => new
                {
                    objectSid = r.getAttribute("distinguishedName").StringValue,
                }).First().objectSid : null;
            });
        }

        public Task<IEnumerable<user>> GetUsers(string groupDn)
        {
            return Task.Run(() =>
            {
                var entries = new List<LdapEntry>();
                try
                {
                    ldapConnection.Bind(LdapConnection.Ldap_V3, $@"{appSettings.LDAPParams.adDomain}\{appSettings.LDAPParams.adAdmin.Split("@").First()}", appSettings.LDAPParams.adPassword);
                    string filter = $"(memberOf={groupDn})";
                    var searchResult = ldapConnection.Search(appSettings.LDAPParams.@base, LdapConnection.SCOPE_SUB, filter, null, false);
                    while (searchResult.HasMore())
                    {
                        try
                        {
                            entries.Add(searchResult.Next());
                        }
                        catch (LdapReferralException e)
                        {
                            var u = e.getReferrals();
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                }
                var adUsers = entries.Select(r => new user
                {
                    objectSid = r.getAttribute("objectSid") != null ? new SecurityIdentifier((byte[])(Array)r.getAttribute("objectSid").ByteValue, 0).ToString() : null,
                    accountName = r.getAttribute("sAMAccountName").StringValue,
                    firstName = r.getAttribute("name") != null ? r.getAttribute("name").StringValue.ToCamelCase() : null,
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
                    deleted = false,
                    editedBy = r.getAttribute("objectSid") != null ? new SecurityIdentifier((byte[])(Array)r.getAttribute("objectSid").ByteValue, 0).ToString() : string.Empty,
                    lastUpdate = DateTime.Now,
                    createdBy = r.getAttribute("objectSid") != null ? new SecurityIdentifier((byte[])(Array)r.getAttribute("objectSid").ByteValue, 0).ToString() : string.Empty,
                    createdDate = DateTime.Now,
                    tckn = r.getAttribute("tc") != null ? r.getAttribute("tc").StringValue : null
                });

                var dbUserSids = dbContext.users.Select(u => u.objectSid).ToList();

                foreach (var adUser in adUsers.Where(u => !dbUserSids.Contains(u.objectSid)))
                {
                    dbContext.Add(adUser);
                }

                dbContext.SaveChanges();

                return adUsers;
            });
        }

        public async Task sendEmail(string emailAddress, string title, string message)
        {
            try
            {
                var mailHtml = File.ReadAllText("HtmlTemplates/mail.html").Replace("${message}", message);
                using (var stream = new MemoryStream(Encoding.UTF8.GetBytes(mailHtml)))
                {
                    MailMessage mail = new MailMessage(new MailAddress("info@idea.com.tr", "Idea Stok Takip", Encoding.UTF8), new MailAddress(emailAddress));
                    mail.Subject = title;
                    mail.Body = message;
                    mail.IsBodyHtml = true;
                    mail.BodyEncoding = Encoding.UTF8;
                    mail.HeadersEncoding = Encoding.UTF8;
                    mail.SubjectEncoding = Encoding.UTF8;
                    mail.Body = mailHtml;

                    SmtpClient mailClient = new SmtpClient("mail.trabzon.bel.tr");// Bilinmiyor
                    mailClient.Port = 587;
                    mailClient.UseDefaultCredentials = false;
                    mailClient.Credentials = new NetworkCredential("info@idea.com.tr", "1Qaz2wsx*");// Şifre bilinmiyor
                    mailClient.EnableSsl = false;

                    var transportProp = mailClient.GetType().GetField("_transport", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                    var transport = transportProp.GetValue(mailClient);
                    var authModulesProp = transport.GetType()
                        .GetField("_authenticationModules", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                    var authModules = authModulesProp.GetValue(transport) as Array;
                    var activemodule = authModules.GetValue(authModules.Length - 1);
                    var newModules = Array.CreateInstance(activemodule.GetType(), 1);
                    newModules.SetValue(activemodule, 0);

                    authModulesProp.SetValue(transport, newModules);

                    mailClient.Send(mail);

                    await Task.CompletedTask;
                }
            }
            catch (Exception e)
            {
            }
        }

        protected virtual void Dispose(bool b)
        {
            if (ldapConnection != null) ldapConnection.Dispose();
            GC.SuppressFinalize(this);
        }
        
        public void Dispose()
        {
            Dispose(true);
        }
    }
}
