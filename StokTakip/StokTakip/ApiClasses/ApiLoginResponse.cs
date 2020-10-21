using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiLoginResponse
    {
        public string name { get; set; }
        public string surname { get; set; }
        public string userName { get; set; }
        public string token { get; set; }
    }
}
