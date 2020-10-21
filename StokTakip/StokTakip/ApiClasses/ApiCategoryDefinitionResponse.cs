using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiCategoryDefinitionResponse
    {
        public Guid id { get; set; }
        public short type { get; set; }
        public string name { get; set; }
        public Guid parentId { get; set; }
        public DateTime? lastUpdate { get; set; }
        public Guid? editedBy { get; set; }
        public bool deleted { get; set; }
        public Guid? createdBy { get; set; }
        public DateTime? createdDate { get; set; }
    }
}
