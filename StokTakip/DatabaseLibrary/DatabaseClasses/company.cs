﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakipBackend.DatabaseClasses
{
    public class company : LogTableBase
    {
        public string name { get; set; }
        public string taxNo { get; set; }
        public string address { get; set; }
        public string eposta { get; set; }
        public string phone { get; set; }
        public string webSite { get; set; }
        public bool isShipping { get; set; }

    }
}
