using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiForgotPasswordResponse
    {
        public string userName { get; set; }
        public string email { get; set; }
        public string token { get; set; }
    }
}
