using System;
using System.Collections.Generic;
using System.Text;

namespace StokTakipBackend.DatabaseClasses
{
    public class project: LogTableBase
    {
        public string name { get; set; }
        public Guid companyId { get; set; }
        public string givenManager { get; set; }
        public string receivedManager { get; set; }

    }
}
