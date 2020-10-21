using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Novell.Directory.Ldap;
using StokTakip.ApiClasses;
using StokTakip.Helpers;
using StokTakip.ServicesClasses;
using StokTakipBackend.DatabaseClasses;

namespace StokTakip.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private AuthenticationService authService;
        private readonly AppSettings _appSettings;
        private StockTrackingDbContext dbContext;

        public AuthenticationController(AuthenticationService authService, IOptions<AppSettings> appSettings, StockTrackingDbContext context)
        {
            this.authService = authService;
            this._appSettings = appSettings.Value;
            this.dbContext = context;
        }

        [HttpPost("/api/login")]
        public async Task<ApiResponse> Login(ApiLoginRequest request)
        {
            try
            {
                var user = (await dbContext.users.FirstOrDefaultAsync(r =>
                    r.accountName == request.accountName && r.password != null && r.password == request.password && !r.deleted
                )) ?? (await authService.GetUserInfo(request.accountName, request.password)).FirstOrDefault();

                if(user.userPhoto == null && user.thumbnailPhoto == null)
                {
                    var userPhoto = await dbContext.users.FirstOrDefaultAsync(r => r.objectSid == user.objectSid);
                    user.userPhoto = userPhoto.userPhoto;
                }

                if (user != null)
                {
                    var userPriviliges = await dbContext.users
                        .Where(r => r.objectSid == user.objectSid)
                        .ToListAsync();
                    var adminOf = userPriviliges.Where(r => (r.authorityLevel & (long)UserRoles.Admin) == (long)UserRoles.Admin).ToList();
                    var userOf = userPriviliges.Where(r => (r.authorityLevel & (long)UserRoles.User) == (long)UserRoles.User).ToList();
                    bool isSupervisor = userPriviliges.Where(r => (r.authorityLevel & (long)UserRoles.Admin) == (long)UserRoles.Admin).Count() > 0;
                    bool isUser = userPriviliges.Where(r => (r.authorityLevel & (long)UserRoles.User) == (long)UserRoles.User).Count() > 0;
                    bool isWarehouseWorker = userPriviliges.Where(r => (r.authorityLevel & (long)UserRoles.WarehouseWorker) == (long)UserRoles.WarehouseWorker).Count() > 0;
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.UTF8.GetBytes(_appSettings.Secret);
                    var claimsIdentity = new ClaimsIdentity(new Claim[] {
                        new Claim(ClaimTypes.NameIdentifier, user.objectSid),
                        new Claim(ClaimTypes.Name, user.displayName),
                        new Claim(ClaimTypes.Email, user.userPrincipalName)
                    });
                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = claimsIdentity,
                        Expires = DateTime.Now.AddDays(7),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var token = tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
                    return ApiResponseErrorType.OK.CreateResponse(new
                    {
                        city = user.city?.ToCamelCase(),
                        company = user.company?.ToCamelCase(),
                        deparment = user.department?.ToCamelCase(),
                        displayName = user.displayName?.ToNameFormat(),
                        email = user.email?.ToLowerInvariant(),
                        firstName = user.firstName?.ToCamelCase(),
                        user.ipPhone,
                        lastName = user.lastName?.ToUpper(CultureInfo.GetCultureInfo("tr-TR")),
                        user.memberOf,
                        user.accountName,
                        user.mobile,
                        user.objectSid,
                        user.postalCode,
                        semt = user.semt?.ToCamelCase(),
                        streetAddress = user.streetAddress?.ToCamelCase(),
                        user.telephoneNumber,
                        thumbnailPhoto = user.thumbnailPhoto ?? user.userPhoto,
                        title = user.title?.ToCamelCase(),
                        userPrincipalName = user.userPrincipalName?.ToLowerInvariant(),
                        wWWHomePage = user.wWWHomePage?.ToLowerInvariant(),
                        adminOf,
                        userOf,
                        isSupervisor,
                        isWarehouseWorker,
                        isUser,
                        token,
                    });
                }

                return ApiResponseErrorType.AuthenticationFailed.CreateResponse();
            }
            catch (LdapException lex)
            {
                return lex.GetUnderlineLdapExceptionCode().CreateResponse();
            }
            catch (Exception e)
            {
                return e.Message.CreateResponse();
            }
        }

        [HttpGet("/api/forgotPassword")]
        public async Task<ApiResponse> ForgotPassword(ApiForgotPasswordRequeest request)
        {
            try
            {
                var forgotUser = await dbContext.users.FirstOrDefaultAsync(r => r.email == request.email);
                if (forgotUser != null)
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var key = Encoding.UTF8.GetBytes(_appSettings.Secret);
                    var claimsIdentity = new ClaimsIdentity(new Claim[] {
                        new Claim(ClaimTypes.NameIdentifier, forgotUser.objectSid),
                        new Claim(ClaimTypes.Name, forgotUser.displayName),
                        new Claim(ClaimTypes.Email, forgotUser.email)
                    });
                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = claimsIdentity,
                        Expires = DateTime.Now.AddDays(7),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var token = tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
                    var url = Url.Action("ResetPassword", "Account",
                        new { UserId = forgotUser.objectSid, code = token }, protocol: Request.Scheme);
                    // TODO : parola yenileme bağlantısı gönderme yapılacak
                    authService.sendEmail(
                                forgotUser.email,
                                "Idea Stok Takip Şifte Yenileme Bağlantısı",
                                "Parolanızı fıfırlamak için tıklayınız: <a href=\"" + url + "\">link</a>"
                            );
                    return ApiResponseErrorType.OK.CreateResponse(new
                    {
                        forgotUser.accountName,
                        forgotUser.email,
                        token
                    });
                }
                return ApiResponseErrorType.NotEMailUser.CreateResponse();
            }
            catch (Exception e)
            {

                throw;
            }
        }
    }
}
