using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiSubCategoryDefinitionResponse
    {
        public string parentName { get; set; }
        public string parentId { get; set; }
        public string childName { get; set; }
        public string childId { get; set; }
    }
}
