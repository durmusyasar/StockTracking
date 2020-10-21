using System;
using System.Collections.Generic;
using System.Text;

namespace StokTakipBackend.DatabaseClasses
{
    public class userAccount: LogTableBase
    {
        public string userId { get; set; }
        public string linkedinAccount { get; set; }
        public string googleAccount { get; set; }
        public string facebookAccount { get; set; }
        public string twitterAccount { get; set; }
        public string instagramAccount { get; set; }
        public string bloggerAccount { get; set; }
        public string youtubeAccount { get; set; }

    }
}
