using System;
using System.Collections.Generic;
using System.Text;

namespace StokTakipBackend.DatabaseClasses
{
    public class companyUser
    {
        public Guid companyId { get; set; }
        public string userId { get; set; }
        public DateTime lastUpdate { get; set; } = DateTime.Now;
        public string editedBy { get; set; }
        public bool deleted { get; set; } = false;
        public string createdBy { get; set; }
        public DateTime createdDate { get; set; }

    }
}
