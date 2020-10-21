using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiProjectDefinitionRequest
    {
        public Guid? id { get; set; }
        public string name { get; set; }
        public Guid companyId { get; set; }
        public string givenManager { get; set; }
        public string receivedManager { get; set; }
        public bool deleted { get; set; }
    }
}
