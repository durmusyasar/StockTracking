using Novell.Directory.Ldap;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace StokTakip.ServicesClasses
{
    public static class LdapExceptionHelper
    {
        private static Dictionary<string, string> errorMessages = new Dictionary<string, string>(new KeyValuePair<string, string>[] {
            new KeyValuePair<string, string>("525", "Kullanıcı Bulunamadı."),
            new KeyValuePair<string, string>("52e", "Geçersiz Kimlik."),
            new KeyValuePair<string, string>("530", "Bu Saate Oturum Açma İzniniz Yok."),
            new KeyValuePair<string, string>("531", "Bu İstasyondan Oturum Açma İzniniz Yok."),
            new KeyValuePair<string, string>("532", "Şifrenizin Geçerlilik Süresi Sona Erdi. Lütfen Şifrenizi Yeniden Oluşturunuz."),
            new KeyValuePair<string, string>("533", "Hesabınız Askıya Alındı. Lütfen Sistem Yöneticinize Başvurun."),
            new KeyValuePair<string, string>("701", "Hesabınızın Geçerlilik Süresi Sona Erdi. Lütfen Sistem Yöneticinize Başvurun."),
            new KeyValuePair<string, string>("773", "Şifrenizi Yenilemeniz Gerekiyor. Lütfen Şifrenizi Yeniden Oluşturunuz."),
            new KeyValuePair<string, string>("775", "Hesabınız Kilitlendi. Lütfen Sistem Yöneticinize Başvurun."),
        });
        public static string GetUnderlineLdapExceptionCode(this LdapException e)
        {
            var errorCode = new Regex(@"(?<=data\s)\S{3}", RegexOptions.IgnoreCase | RegexOptions.Multiline).Match(e.LdapErrorMessage).Value;
            return errorMessages.ContainsKey(errorCode) ? errorMessages[errorCode] : "Bilinmeyen Bir Hata Oluştu. Lütfen Sistem Yöneticinize Başvurun.";
        }
    }
}
