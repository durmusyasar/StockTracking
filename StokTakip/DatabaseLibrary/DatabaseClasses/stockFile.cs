using System;
using System.Collections.Generic;
using System.Text;

namespace StokTakipBackend.DatabaseClasses
{
    public class stockFile : LogTableBase
    {
        public Guid stockId { get; set; }
        public string fileDescription { get; set; }
        public string file { get; set; }

    }
}
