using System;
using System.Collections.Generic;
using System.Text;

namespace StokTakipBackend.DatabaseClasses
{
    public class stockProduct : LogTableBase
    {
        public Guid stockId { get; set; }
        public string department { get; set; }
        public string serialNo { get; set; }
        public int quantity { get; set; }

    }
}
