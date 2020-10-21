using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiCategoryDefinitionRequest
    {
        public Guid? id { get; set; }
        public short type { get; set; }
        public string name { get; set; }
        public Guid parentId { get; set; }
        public bool deleted { get; set; }
    }
}
