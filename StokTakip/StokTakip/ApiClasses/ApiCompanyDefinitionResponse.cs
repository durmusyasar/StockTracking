using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiCompanyDefinitionResponse
    {
        public Guid id { get; set; }
        public string name { get; set; }
        public string taxNo { get; set; }
        public string address { get; set; }
        public string eposta { get; set; }
        public string phone { get; set; }
        public string webSite { get; set; }
    }
}
