using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ApiClasses
{
    public class ApiStockDefinitionRequest
    {
        public string invoiceNo { get; set; }
        public Guid projectId { get; set; }
        public Guid incomingCompanyId { get; set; }
        public Guid outgoingCompanyId { get; set; }
        public Guid? shippingCompanyId { get; set; }
        public Guid? shippingUserId { get; set; }
        public ApiStockProductItem[] productRows { get; set; }
        public DateTime date { get; set; }
        public string receiverId { get; set; }
        public string deliveryPersonId { get; set; }
        public bool deleted { get; set; }
        public List<string> file { get; set; }
        public List<string> fileName { get; set; }
    }
}
