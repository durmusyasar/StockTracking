using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakipBackend.DatabaseClasses
{
    public class LogTableBase
    {
        public Guid? id { get; set; } = Guid.NewGuid();
        public DateTime? lastUpdate { get; set; } = DateTime.Now;
        public string editedBy { get; set; }
        public bool deleted { get; set; } = false;
        public string createdBy { get; set; }
        public DateTime? createdDate { get; set; }
    }
}
