using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakipBackend.DatabaseClasses
{
    public class category : LogTableBase
    {
        public short type { get; set; }
        public string name { get; set; }
        public Guid parentId { get; set; }

    }
}
