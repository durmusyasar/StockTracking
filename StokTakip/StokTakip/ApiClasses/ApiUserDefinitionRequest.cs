using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiUserDefinitionRequest
    {
        public string objectSid { get; set; }
        public string password { get; set; }
        public string displayName { get; set; }
        public string accountName { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string userPrincipalName { get; set; }
        public string mobile { get; set; }
        public string ipPhone { get; set; }
        public string department { get; set; }
        public ApiCompanyDefinitionRequest company { get; set; }
        public string telephoneNumber { get; set; }
        public DateTime? birtOfDate { get; set; }
        public bool? genus { get; set; }
        public string about { get; set; }
        public string userPhoto { get; set; }
        public bool deleted { get; set; }
        public int authorityLevel { get; set; }
    }
}
