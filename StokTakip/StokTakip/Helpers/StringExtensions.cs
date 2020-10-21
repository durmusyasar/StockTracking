using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakip.Helpers
{
    public static class StringExtensions
    {
        public static string[] IgnoreWords =
            new string[] {
            "ve",
            "veya",
            "ile"
        };

        public static string[] IgnoreFirstLetters = new string[]
        {
            "/", "\\", "(", "["
        };

        public static string ToUpperFirst(this string s, CultureInfo cultureInfo = null)
        {
            cultureInfo = cultureInfo ?? CultureInfo.GetCultureInfo("tr-TR");
            s = s.ToLower(cultureInfo);
            var ignoredFisrtLetter = "";
            foreach (var fl in IgnoreFirstLetters)
            {
                if (s.StartsWith(fl))
                {
                    ignoredFisrtLetter = fl;
                    s = s.Substring(1);
                }
            }
            if (string.IsNullOrEmpty(s) || IgnoreWords.Contains(s)) return $"{ignoredFisrtLetter}{s}";
            return $"{ignoredFisrtLetter}{s[0].ToString().ToUpper(cultureInfo)}{s.Substring(1)}";
        }
        
        public static string ToCamelCase(this string s) => string.Join(" ", s.Split(' ').Select(r => r.ToUpperFirst()));
        
        public static string ToNameFormat(this string s)
        {
            if (string.IsNullOrEmpty(s)) return s;
            var ss = s.ToUpper(CultureInfo.GetCultureInfo("tr-TR")).Split(' ');
            ss[0] = ss[0].ToUpperFirst();
            return string.Join(" ", ss);
        }
    }
}
