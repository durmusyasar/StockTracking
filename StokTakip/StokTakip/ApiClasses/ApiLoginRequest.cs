using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiLoginRequest
    {
        public string accountName { get; set; }
        public string password { get; set; }
    }
}
