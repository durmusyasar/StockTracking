using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakipBackend.DatabaseClasses
{
    public class stock : LogTableBase
    {
        public Guid incomingCompanyId { get; set; }
        public Guid outgoingCompanyId { get; set; }
        public Guid? shippingCompanyId { get; set; }
        public Guid? shippingUserId { get; set; }
        public string invoiceNo { get; set; }
        public Guid projectId { get; set; }
        public string barcodeNo { get; set; }
        public string receiver { get; set; }
        public string deliveryPerson { get; set; }
        public DateTime date { get; set; }
        public bool? confirmStatus { get; set; }
        public string confirmById { get; set; }
        public DateTime confirmationDate { get; set; }
        public string note { get; set; }


    }
}
