using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiStockProductItem
    {
        public string serialNo { get; set; }
        public ApiProductDefinitionResponse productName { get; set; }
        public int quantity { get; set; }
        public string department { get; set; }
    }
}
