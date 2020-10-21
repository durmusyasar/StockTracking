using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakipBackend.DatabaseClasses
{
    public class user
    {
        public string objectSid { get; set; }
        public string accountName { get; set; }
        public string password { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string displayName { get; set; }
        public string userPrincipalName { get; set; }
        public string mobile { get; set; }
        public string ipPhone { get; set; }
        public string telephoneNumber { get; set; }
        public string city { get; set; }
        public string semt { get; set; }
        public string email { get; set; }
        public string company { get; set; }
        public string department { get; set; }
        public string title { get; set; }
        public string streetAddress { get; set; }
        public string postalCode { get; set; }
        public string wWWHomePage { get; set; }
        public string thumbnailPhoto { get; set; }
        public string editedBy { get; set; }
        public DateTime? birtOfDate { get; set; }
        public bool? genus { get; set; }
        public string about { get; set; }
        public string userPhoto { get; set; }
        public int authorityLevel { get; set; }
        public bool deleted { get; set; }
        public DateTime lastUpdate { get; set; }
        public string createdBy { get; set; }
        public DateTime createdDate { get; set; }
        public string tckn { get; set; }

        private List<string> _memberOf = new List<string>();
        [NotMapped]
        public List<string> memberOf { get => _memberOf; set => _memberOf = value ?? new List<string>(); }

    }
}
