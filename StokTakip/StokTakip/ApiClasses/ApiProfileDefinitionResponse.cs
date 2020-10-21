using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiProfileDefinitionResponse
    {
        public Guid id { get; set; }
        public string name { get; set; }
        public string surname { get; set; }
        public string userName { get; set; }
        public string password { get; set; }
        public string mobile { get; set; }
        public string phone { get; set; }
        public string email { get; set; }
        public string genus { get; set; }
        public string department { get; set; }
        public string thumbnailPhoto { get; set; }
        public string birtOfDate { get; set; }
        public string companyId { get; set; }
        public string about { get; set; }
    }
}
