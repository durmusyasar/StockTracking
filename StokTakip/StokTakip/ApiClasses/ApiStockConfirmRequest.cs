using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiStockConfirmRequest
    {
        public Guid stockId { get; set; }
        public bool confirmStatus { get; set; }
        public string? note { get; set; }
    }
}
