using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ServicesClasses
{
    public class LDAPParams
    {
        public string adHost { get; set; }
        public string adDomain { get; set; }
        public string @base { get; set; }
        public string adAdmin { get; set; }
        public string adPassword { get; set; }
    }

    public class AppSettings
    {
        public string Secret { get; set; }
        public string Image { get; set; }
        public LDAPParams LDAPParams { get; set; }
    }
}
