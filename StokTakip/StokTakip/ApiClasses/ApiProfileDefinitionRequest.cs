using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiProfileDefinitionRequest
    {
        public string objectSid { get; set; }
        public string password { get; set; }
        public string displayName { get; set; }
        public string userPrincipalName { get; set; }
        public string mobile { get; set; }
        public string ipPhone { get; set; }
        public string telephoneNumber { get; set; }
        public DateTime? birtOfDate { get; set; }
        public bool? genus { get; set; }
        public string about { get; set; }
        public string userPhoto { get; set; }

        public string? linkedinAccount { get; set; }
        public string? googleAccount { get; set; }
        public string? facebookAccount { get; set; }
        public string? twitterAccount { get; set; }
        public string? instagramAccount { get; set; }
        public string? bloggerAccount { get; set; }
        public string? youtubeAccount { get; set; }

    }
}
