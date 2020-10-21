using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakipBackend.DatabaseClasses
{
    public class product : LogTableBase
    {
        public string name { get; set; }
        public string barcodeNo { get; set; }
        public int criticalLevel { get; set; }
        public string genus { get; set; }
        public Guid categoryId { get; set; }
        public int inStock { get; set; }
    }
}
