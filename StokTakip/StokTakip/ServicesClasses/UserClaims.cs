using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.ServicesClasses
{
    public class UserClaims
    {
        public string objectSID { get; set; }

        private string _adminOf = string.Empty;
        public string adminOf
        {
            get => _adminOf;
            set
            {
                _adminOf = value ?? string.Empty;
                AdminOf = _adminOf.Split(",", StringSplitOptions.RemoveEmptyEntries).Select(r => Guid.Parse(r)).ToList();
            }
        }

        public List<Guid> AdminOf { get; private set; } = new List<Guid>();

        private string _userOf = string.Empty;
        public string userOf
        {
            get => _userOf;
            set
            {
                _userOf = value ?? string.Empty;
                UserOf = _userOf.Split(",", StringSplitOptions.RemoveEmptyEntries).Select(r => Guid.Parse(r)).ToList();
            }
        }

        public List<Guid> UserOf { get; private set; } = new List<Guid>();
    }
}
