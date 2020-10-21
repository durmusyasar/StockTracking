using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StokTakipBackend.DatabaseClasses
{
    public class StockTrackingDbContext : DbContext
    {
        public StockTrackingDbContext(DbContextOptions optinos) : base(optinos)
        {
        }

        public DbSet<user> users { get; set; }
        public DbSet<company> companies { get; set; }
        public DbSet<category> categories { get; set; }
        public DbSet<product> products { get; set; }
        public DbSet<stock> stocks { get; set; }
        public DbSet<project> projects { get; set; }
        public DbSet<stockProduct> stockProducts { get; set; }
        public DbSet<companyUser> companyUsers { get; set; }
        public DbSet<stockFile> stockFiles { get; set; }
        public DbSet<userAccount> userAccounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<companyUser>(o =>
            {
                o.HasKey(r => new { r.userId, r.companyId });   
            });

            modelBuilder.Entity<user>(o =>
            {
                o.HasKey(r => r.objectSid);
            });

            modelBuilder.Entity<stockProduct>(o =>
            {
                o.Property(r => r.id).HasColumnName("productId");
                o.HasKey(r => new { r.stockId, r.id });
            });

        }
    }
}
