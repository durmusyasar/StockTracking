using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiSubCategoryDefinitionRequest
    {
        public Guid categoryId { get; set; }
        public string subCategory { get; set; }
        public short type { get; set; }
        public bool deleted { get; set; }
    }
}
