using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StokTakip.ApiClasses;
using StokTakip.ServicesClasses;
using StokTakipBackend.DatabaseClasses;

namespace StokTakip.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DefinitionsController : ControllerBase
    {
        private StockTrackingDbContext dbContext;
        private readonly AuthenticationService authService;
        private readonly AppSettings _appSettings;

        public DefinitionsController(
            StockTrackingDbContext context,
            AuthenticationService authService,
            IOptions<AppSettings> appSettings
            )
        {
            dbContext = context;
            this.authService = authService;
            this._appSettings = appSettings.Value;
        }

        #region Category

        [HttpGet("categories")]
        public async Task<ApiResponse> GetCategories()
        {
            try
            {
                var categories = await dbContext.categories
                    .Where(r => !r.deleted && r.type == 0)
                    .OrderBy(r => r.name)
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(categories);
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        [HttpPost("categoryList")]
        public async Task<ApiResponse> GetCategoryList(Pagination request = null)
        {
            try
            {
                request = request ?? new Pagination
                {
                    page = request.page,
                    rowsPerPage = request.rowsPerPage
                };

                var subCategories = dbContext.categories
                    .Join(dbContext.categories, c => c.id, sc => sc.parentId, (c, sc) => new { c, sc })
                    .Join(dbContext.users, y => y.sc.editedBy, x => x.objectSid, (y, x) => new { y, x })
                    .Where(r => !r.x.deleted && !r.y.sc.deleted && !r.y.c.deleted)
                    .OrderBy(r => r.y.c.name)
                    .Select(r => new
                    {
                        parentName = r.y.c.name,
                        parentId = r.y.c.id,
                        childName = r.y.sc.name,
                        childId = r.y.sc.id,
                        editedBy = r.x.displayName,
                        lastUpdate = r.y.sc.lastUpdate
                    });

                var count = await subCategories.CountAsync();
                var pagination = new PaginationResponse
                {
                    page = request.page,
                    pageCount = (int)Math.Ceiling(count * 1.0 / request.rowsPerPage),
                    rowCount = count,
                    rowsPerPage = request.rowsPerPage
                };
                var response = await subCategories
                    .Skip(request.rowsPerPage * (request.page - 1))
                    .Take(request.rowsPerPage)
                    .ToListAsync();

                return pagination.CreateResponse(response);
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        [HttpPost("saveCategory")]
        public async Task<ApiResponse> SaveCategory(ApiCategoryDefinitionRequest request)
        {
            try
            {
                var category = dbContext.categories.SingleOrDefault(r => !r.deleted && r.id == request.id);

                if (category == null)
                {
                    category = new category
                    {
                        createdBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        deleted = request.deleted,
                        editedBy = authService.UserClaims.objectSID,
                        id = Guid.NewGuid(),
                        lastUpdate = DateTime.Now,
                        name = request.name,
                        parentId = request.type == 0 ? Guid.Empty : request.parentId,
                        type = request.type,
                    };
                    dbContext.Entry(category).State = EntityState.Added;
                }
                else
                {
                    category.lastUpdate = DateTime.Now;
                    category.name = request.name;
                    category.parentId = request.parentId;
                    category.type = request.type;
                    category.editedBy = authService.UserClaims.objectSID;
                    category.deleted = request.deleted;

                    dbContext.Entry(category).State = EntityState.Modified;
                    if (request.type == 0 && request.deleted == true)
                    {
                        var subcategoryList = await dbContext.categories
                            .Where(r => !r.deleted && r.type == 1 && r.parentId == request.id).ToArrayAsync();

                        foreach (var item in subcategoryList)
                        {
                            item.deleted = true;
                            item.editedBy = authService.UserClaims.objectSID;
                            item.lastUpdate = DateTime.Now;
                            dbContext.Entry(item).State = EntityState.Modified;
                        }
                    }
                }
                await dbContext.SaveChangesAsync();
                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        [HttpGet("subCategories")]
        public async Task<ApiResponse> GetSubCategories()
        {
            try
            {
                var subCategories = await dbContext.categories
                    .Join(dbContext.categories, c => c.id, sc => sc.parentId, (c, sc) => new { c, sc })
                    .Join(dbContext.users, y => y.sc.editedBy, x => x.objectSid, (y, x) => new { y, x })
                    .Where(r => !r.x.deleted && !r.y.sc.deleted && !r.y.c.deleted)
                    .OrderBy(r => r.y.c.name)
                    .Select(r => new
                    {
                        parentName = r.y.c.name,
                        parentId = r.y.c.id,
                        childName = r.y.sc.name,
                        childId = r.y.sc.id,
                        editedBy = r.x.displayName,
                        lastUpdate = r.y.sc.lastUpdate
                    }).ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(subCategories);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpGet("subCategoryList")]
        public async Task<ApiResponse> GetSubCategoryList()
        {
            try
            {
                var subCategories = await dbContext.categories
                    .Where(r => !r.deleted && r.type == 1)
                    .OrderBy(r => r.name)
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(subCategories);
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        #endregion

        #region Company

        [HttpPost("companyList")]
        public async Task<ApiResponse> GetCompanyList(Pagination request = null)
        {
            try
            {
                request = request ?? new Pagination
                {
                    page = request.page,
                    rowsPerPage = request.rowsPerPage
                };

                var company = dbContext.companies
                    .Where(r => !r.deleted);

                var count = await company.CountAsync();
                var pagination = new PaginationResponse
                {
                    page = request.page,
                    pageCount = (int)Math.Ceiling(count * 1.0 / request.rowsPerPage),
                    rowCount = count,
                    rowsPerPage = request.rowsPerPage
                };
                var response = await company
                    .Skip(request.rowsPerPage * (request.page - 1))
                    .Take(request.rowsPerPage)
                    .ToListAsync();

                return pagination.CreateResponse(response);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpGet("companies")]
        public async Task<ApiResponse> GetCompanies()
        {
            try
            {
                var company = await dbContext.companies
                    .Where(r => !r.deleted)
                    .ToListAsync();

                return ApiResponseErrorType.OK.CreateResponse(company);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("companyUser/{companyId}")]
        public async Task<ApiResponse> GetCompanyUser(Guid companyId)
        {
            try
            {
                var companies = await dbContext.companyUsers
                    .Join(dbContext.users, c => c.userId, u => u.objectSid, (c, u) => new { c, u })
                    .Where(r => !r.c.deleted && !r.u.deleted && r.c.companyId == companyId)
                    .Select(r => new
                    {
                        r.u.objectSid,
                        r.u.displayName,
                        r.u.department,
                        r.u.thumbnailPhoto,
                        r.u.telephoneNumber,
                        r.u.userPhoto,
                        r.u.mobile,
                        r.u.email
                    })
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(companies);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("userCompany/{userId}")]
        public async Task<ApiResponse> GetUserCompany(string userId)
        {
            try
            {
                var companies = await dbContext.companyUsers
                    .Join(dbContext.companies, c => c.companyId, u => u.id, (c, u) => new { c, u })
                    .Where(r => !r.c.deleted && !r.u.deleted && r.c.userId == userId)
                    .Select(r => new
                    {
                        r.u.id,
                        r.u.isShipping,
                        r.u.name,
                        r.u.phone,
                        r.u.taxNo,
                        r.u.webSite,
                        r.u.address,
                        r.u.eposta
                    })
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(companies);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }


        [HttpPost("saveCompany")]
        public async Task<ApiResponse> SaveCompany(ApiCompanyDefinitionRequest request)
        {
            try
            {

                var company = await dbContext.companies.SingleOrDefaultAsync(r => !r.deleted && r.id == request.id);

                if (company == null)
                {
                    company = new company
                    {
                        address = request.address,
                        createdBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        deleted = request.deleted,
                        editedBy = authService.UserClaims.objectSID,
                        eposta = request.eposta,
                        id = Guid.NewGuid(),
                        lastUpdate = DateTime.Now,
                        name = request.name,
                        phone = request.phone,
                        taxNo = request.taxNo,
                        webSite = request.webSite,
                        isShipping = request.isShipping
                    };
                    dbContext.Entry(company).State = EntityState.Added;
                }
                else
                {
                    company.address = request.address;
                    company.deleted = request.deleted;
                    company.editedBy = authService.UserClaims.objectSID;
                    company.eposta = request.eposta;
                    company.lastUpdate = DateTime.Now;
                    company.name = request.name;
                    company.phone = request.phone;
                    company.taxNo = request.taxNo;
                    company.webSite = request.webSite;
                    company.isShipping = request.isShipping;

                    dbContext.Entry(company).State = EntityState.Modified;
                }

                await dbContext.SaveChangesAsync();
                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }


        #endregion

        #region Product

        [HttpPost("productList")]
        public async Task<ApiResponse> GetProductList(Pagination request = null)
        {
            try
            {
                request = request ?? new Pagination
                {
                    page = request.page,
                    rowsPerPage = request.rowsPerPage
                };

                var products = dbContext.products
                    .Where(r => !r.deleted);

                var count = await products.CountAsync();
                var pagination = new PaginationResponse
                {
                    page = request.page,
                    pageCount = (int)Math.Ceiling(count * 1.0 / request.rowsPerPage),
                    rowCount = count,
                    rowsPerPage = request.rowsPerPage
                };
                var response = await products
                    .Skip(request.rowsPerPage * (request.page - 1))
                    .Take(request.rowsPerPage)
                    .ToListAsync();

                return pagination.CreateResponse(response);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpGet("products")]
        public async Task<ApiResponse> GetProducts()
        {
            try
            {
                var products = await dbContext.products
                    .Where(r => !r.deleted)
                    .OrderBy(r => r.name)
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(products);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("saveProduct")]
        public async Task<ApiResponse> SaveProduct(ApiProductDefinitionRequest request)
        {
            try
            {
                var product = dbContext.products.SingleOrDefault(r => r.id == request.id);

                if (product == null)
                {
                    product = new product
                    {
                        createdBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        deleted = request.deleted,
                        editedBy = authService.UserClaims.objectSID,
                        id = Guid.NewGuid(),
                        lastUpdate = DateTime.Now,
                        name = request.name,
                        barcodeNo = request.barcodeNo,
                        categoryId = request.categoryId,
                        criticalLevel = request.criticalLevel,
                        genus = request.genus,
                        inStock = request.inStock
                    };
                    dbContext.Entry(product).State = EntityState.Added;
                }
                else
                {
                    product.lastUpdate = DateTime.Now;
                    product.name = request.name;
                    product.criticalLevel = request.criticalLevel;
                    product.categoryId = request.categoryId;
                    product.genus = request.genus;
                    product.editedBy = authService.UserClaims.objectSID;
                    product.deleted = request.deleted;
                    product.inStock = request.inStock;

                    dbContext.Entry(product).State = EntityState.Modified;

                }
                await dbContext.SaveChangesAsync();
                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        #endregion

        #region Profile

        [HttpGet("profile/{userName}")]
        public async Task<ApiResponse> GetUserProfile(string userName)
        {
            try
            {
                var userProfile = await dbContext.users
                    .Where(r => !r.deleted && r.accountName == userName)
                    .SingleOrDefaultAsync();
                return ApiResponseErrorType.OK.CreateResponse(userProfile);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("account/{userId}")]
        public async Task<ApiResponse> GetUserAccountProfile(string userId)
        {
            try
            {
                var userProfile = await dbContext.userAccounts
                    .Where(r => !r.deleted && r.userId == userId)
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(userProfile);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("saveUserProfile")]
        public async Task<ApiResponse> SaveUserProfile(ApiProfileDefinitionRequest request)
        {
            try
            {
                var user = dbContext.users.SingleOrDefault(r => r.objectSid == request.objectSid);

                if (user != null)
                {
                    user.about = request.about;
                    user.birtOfDate = request.birtOfDate;
                    user.displayName = request.displayName;
                    user.email = request.userPrincipalName;
                    user.editedBy = authService.UserClaims.objectSID;
                    user.genus = request.genus;
                    user.lastUpdate = DateTime.Now;
                    user.ipPhone = request.ipPhone;
                    user.mobile = request.mobile;
                    user.password = request.password;
                    user.telephoneNumber = request.telephoneNumber;
                    user.userPhoto = request.userPhoto ?? _appSettings.Image;
                    user.userPrincipalName = request.userPrincipalName;

                    dbContext.Entry(user).State = EntityState.Modified;

                }

                var userAccount = await dbContext.userAccounts
                    .SingleOrDefaultAsync(r => !r.deleted && r.userId == user.objectSid);

                if (userAccount == null)
                {
                    userAccount = new userAccount
                    {
                        id = Guid.NewGuid(),
                        userId = user.objectSid,
                        deleted = false,
                        bloggerAccount = request.bloggerAccount,
                        facebookAccount = request.facebookAccount,
                        googleAccount = request.googleAccount,
                        instagramAccount = request.instagramAccount,
                        linkedinAccount = request.linkedinAccount,
                        twitterAccount = request.twitterAccount,
                        youtubeAccount = request.youtubeAccount,
                        createdBy = authService.UserClaims.objectSID,
                        editedBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        lastUpdate = DateTime.Now,
                    };
                    dbContext.Entry(userAccount).State = EntityState.Added;
                }
                else
                {
                    userAccount.bloggerAccount = request.bloggerAccount;
                    userAccount.facebookAccount = request.facebookAccount;
                    userAccount.googleAccount = request.googleAccount;
                    userAccount.instagramAccount = request.instagramAccount;
                    userAccount.linkedinAccount = request.linkedinAccount;
                    userAccount.twitterAccount = request.twitterAccount;
                    userAccount.youtubeAccount = request.youtubeAccount;
                    userAccount.editedBy = authService.UserClaims.objectSID;
                    userAccount.lastUpdate = DateTime.Now;

                    dbContext.Entry(userAccount).State = EntityState.Modified;
                }

                await dbContext.SaveChangesAsync();
                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        #endregion

        #region Project

        [HttpPost("projectList")]
        public async Task<ApiResponse> GetProjectList(Pagination request = null)
        {
            try
            {
                request = request ?? new Pagination
                {
                    page = request.page,
                    rowsPerPage = request.rowsPerPage
                };

                var projects = dbContext.projects
                    .Where(r => !r.deleted);

                var count = await projects.CountAsync();
                var pagination = new PaginationResponse
                {
                    page = request.page,
                    pageCount = (int)Math.Ceiling(count * 1.0 / request.rowsPerPage),
                    rowCount = count,
                    rowsPerPage = request.rowsPerPage
                };
                var response = await projects
                    .Skip(request.rowsPerPage * (request.page - 1))
                    .Take(request.rowsPerPage)
                    .ToListAsync();

                return pagination.CreateResponse(response);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpGet("projects")]
        public async Task<ApiResponse> GetProjects()
        {
            try
            {
                var projects = await dbContext.projects
                    .Where(r => !r.deleted)
                    .OrderBy(r => r.name)
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(projects);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("saveProject")]
        public async Task<ApiResponse> SaveProject(ApiProjectDefinitionRequest request)
        {
            try
            {
                var project = dbContext.projects.SingleOrDefault(r => r.id == request.id && !r.deleted);

                if (project == null)
                {
                    project = new project
                    {
                        createdBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        deleted = request.deleted,
                        editedBy = authService.UserClaims.objectSID,
                        id = Guid.NewGuid(),
                        lastUpdate = DateTime.Now,
                        name = request.name,
                        companyId = request.companyId,
                        givenManager = request.givenManager,
                        receivedManager = request.receivedManager,
                    };
                    dbContext.Entry(project).State = EntityState.Added;
                }
                else
                {
                    project.lastUpdate = DateTime.Now;
                    project.name = request.name;
                    project.companyId = request.companyId;
                    project.givenManager = request.givenManager;
                    project.receivedManager = request.receivedManager;
                    project.editedBy = authService.UserClaims.objectSID;
                    project.deleted = request.deleted;

                    dbContext.Entry(project).State = EntityState.Modified;

                }
                await dbContext.SaveChangesAsync();
                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        #endregion

        #region User

        [HttpGet("users")]
        public async Task<ApiResponse> GetUsers()
        {
            try
            {
                var users = await dbContext.users
                    .Where(r => !r.deleted)
                    .OrderBy(r => r.displayName)
                    .ToListAsync();

                return ApiResponseErrorType.OK.CreateResponse(users);
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        [HttpPost("userList")]
        public async Task<ApiResponse> GetUserList(Pagination request = null)
        {
            try
            {
                request = request ?? new Pagination
                {
                    page = request.page,
                    rowsPerPage = request.rowsPerPage
                };
                var users = dbContext.users
                    .Where(r => !r.deleted)
                    .OrderBy(r => r.displayName);

                var count = await users.CountAsync();
                var pagination = new PaginationResponse
                {
                    page = request.page,
                    pageCount = (int)Math.Ceiling(count * 1.0 / request.rowsPerPage),
                    rowCount = count,
                    rowsPerPage = request.rowsPerPage
                };
                var response = await users
                    .Skip(request.rowsPerPage * (request.page - 1))
                    .Take(request.rowsPerPage)
                    .ToListAsync();

                return pagination.CreateResponse(response);
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        [HttpPost("saveUser")]
        public async Task<ApiResponse> SaveUser(ApiUserDefinitionRequest request)
        {
            try
            {
                var user = dbContext.users.SingleOrDefault(r => r.objectSid == request.objectSid);

                if (user == null)
                {
                    user = new user
                    {
                        about = request.about,
                        birtOfDate = request.birtOfDate,
                        createdBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        deleted = request.deleted,
                        department = request.department,
                        company = request.company.name,
                        displayName = request.displayName,
                        accountName = request.accountName,
                        email = request.userPrincipalName,
                        editedBy = authService.UserClaims.objectSID,
                        firstName = request.firstName,
                        genus = request.genus,
                        ipPhone = request.ipPhone,
                        lastName = request.lastName,
                        lastUpdate = DateTime.Now,
                        mobile = request.mobile,
                        objectSid = Guid.NewGuid().ToString(),
                        password = request.password,
                        telephoneNumber = request.telephoneNumber,
                        userPhoto = _appSettings.Image,
                        userPrincipalName = request.userPrincipalName,
                        authorityLevel = request.authorityLevel
                    };

                    dbContext.Entry(user).State = EntityState.Added;

                }
                else
                {
                    user.about = request.about;
                    user.birtOfDate = request.birtOfDate;
                    user.deleted = request.deleted;
                    user.department = request.department;
                    user.company = request.company.name;
                    user.displayName = request.displayName;
                    user.email = request.userPrincipalName;
                    user.editedBy = authService.UserClaims.objectSID;
                    user.genus = request.genus;
                    user.lastUpdate = DateTime.Now;
                    user.firstName = request.firstName;
                    user.lastName = request.lastName;
                    user.ipPhone = request.ipPhone;
                    user.mobile = request.mobile;
                    user.password = request.password;
                    user.telephoneNumber = request.telephoneNumber;
                    user.userPhoto = request.userPhoto;
                    user.userPrincipalName = request.userPrincipalName;
                    user.authorityLevel = request.authorityLevel;

                    dbContext.Entry(user).State = EntityState.Modified;
                }

                var companyUser = await dbContext.companyUsers
                        .SingleOrDefaultAsync(r => !r.deleted && r.userId == user.objectSid);

                if (companyUser == null)
                {
                    companyUser = new companyUser
                    {
                        companyId = (Guid)request.company.id,
                        userId = user.objectSid,
                        deleted = request.deleted,
                        createdBy = authService.UserClaims.objectSID,
                        editedBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        lastUpdate = DateTime.Now
                    };
                    dbContext.Entry(companyUser).State = EntityState.Added;
                }
                else
                {
                    companyUser.companyId = (Guid)request.company.id;
                    companyUser.editedBy = authService.UserClaims.objectSID;
                    companyUser.lastUpdate = DateTime.Now;
                    companyUser.deleted = request.deleted;

                    dbContext.Entry(companyUser).State = EntityState.Modified;
                }
                await dbContext.SaveChangesAsync();
                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException ?? e).Message.CreateResponse();
            }
        }

        #endregion

        #region Stock

        [HttpPost("stockList/{userId}")]
        public async Task<ApiResponse> GetStockList(string userId, Pagination request = null)
        {
            try
            {
                request = request ?? new Pagination
                {
                    page = request.page,
                    rowsPerPage = request.rowsPerPage
                };

                var stocks = dbContext.stocks
                    .Where(r => !r.deleted && r.confirmStatus == null && r.receiver == userId)
                    .OrderBy(r => r.lastUpdate);

                var count = await stocks.CountAsync();
                var pagination = new PaginationResponse
                {
                    page = request.page,
                    pageCount = (int)Math.Ceiling(count * 1.0 / request.rowsPerPage),
                    rowCount = count,
                    rowsPerPage = request.rowsPerPage
                };
                var response = await stocks
                    .Skip(request.rowsPerPage * (request.page - 1))
                    .Take(request.rowsPerPage)
                    .ToListAsync();

                return pagination.CreateResponse(response);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("stockProduct/{stockId}")]
        public async Task<ApiResponse> GetStockProduct(Guid stockId)
        {
            try
            {
                var stockProducts = await dbContext.stockProducts
                    .Where(r => !r.deleted && r.stockId == stockId)
                    .ToListAsync();
                return ApiResponseErrorType.OK.CreateResponse(stockProducts);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("stockHistory")]
        public async Task<ApiResponse> GetStockHistory(Pagination request = null)
        {
            try
            {
                request = request ?? new Pagination
                {
                    page = request.page,
                    rowsPerPage = request.rowsPerPage
                };

                var stocks = dbContext.stocks
                    .Where(r => !r.deleted)
                    .OrderBy(r => r.lastUpdate);

                var count = await stocks.CountAsync();
                var pagination = new PaginationResponse
                {
                    page = request.page,
                    pageCount = (int)Math.Ceiling(count * 1.0 / request.rowsPerPage),
                    rowCount = count,
                    rowsPerPage = request.rowsPerPage
                };
                var response = await stocks
                    .Skip(request.rowsPerPage * (request.page - 1))
                    .Take(request.rowsPerPage)
                    .ToListAsync();

                return pagination.CreateResponse(response);
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("saveStock")]
        public async Task<ApiResponse> SaveStock(ApiStockDefinitionRequest request)
        {
            try
            {
                var stock = await dbContext.stocks
                    .SingleOrDefaultAsync(r => !r.deleted && r.invoiceNo == request.invoiceNo);


                if (stock == null)
                {
                    stock = new stock
                    {
                        //barcodeNo = request.barcodeNo,
                        createdBy = authService.UserClaims.objectSID,
                        editedBy = authService.UserClaims.objectSID,
                        createdDate = DateTime.Now,
                        id = Guid.NewGuid(),
                        incomingCompanyId = request.incomingCompanyId,
                        invoiceNo = request.invoiceNo,
                        date = request.date,
                        deleted = request.deleted,
                        lastUpdate = DateTime.Now,
                        outgoingCompanyId = request.outgoingCompanyId,
                        projectId = request.projectId,
                        receiver = request.receiverId,
                        deliveryPerson = request.deliveryPersonId,
                        shippingCompanyId = request.shippingCompanyId,
                        shippingUserId = request.shippingUserId
                    };

                    dbContext.Entry(stock).State = EntityState.Added;

                    var stockProduct = await dbContext.stockProducts
                            .SingleOrDefaultAsync(r => !r.deleted && r.stockId == stock.id);
                    foreach (var item in request.productRows)
                    {
                        if (item.quantity > 0)
                        {
                            stockProduct = new stockProduct
                            {
                                createdBy = authService.UserClaims.objectSID,
                                editedBy = authService.UserClaims.objectSID,
                                createdDate = DateTime.Now,
                                deleted = false,
                                department = item.department,
                                lastUpdate = DateTime.Now,
                                id = item.productName.id,
                                quantity = item.quantity,
                                serialNo = item.serialNo,
                                stockId = (Guid)stock.id
                            };

                            dbContext.Entry(stockProduct).State = EntityState.Added;
                        }
                        else
                        {
                            throw new Exception("Ürün sayısı 0'dan büyük olmalı!");
                        }

                        var product = await dbContext.products
                            .SingleOrDefaultAsync(r => !r.deleted && r.id == item.productName.id);

                        var userComp = dbContext.companyUsers
                                .FirstOrDefault(r => !r.deleted && r.userId == authService.UserClaims.objectSID);

                        if (product != null)
                        {
                            if (userComp != null)
                            {
                                product.inStock = (request.incomingCompanyId == userComp.companyId) ? product.inStock + item.quantity : product.inStock - item.quantity;
                            }
                            else
                            {
                                throw new Exception("Ürün ekleyebilmeniz için önce bir firma kullanıcısı olmalısınız!");
                            }
                        }
                        else
                        {
                            throw new Exception("Stoğa Ürün Eklemeniz Gerekmektedir!");
                        }
                    }
                    for (int i = 0; i < request.file.Count; i++)
                    {
                        dbContext.stockFiles.Add(new stockFile
                        {
                            createdBy = authService.UserClaims.objectSID,
                            editedBy = authService.UserClaims.objectSID,
                            createdDate = DateTime.Now,
                            lastUpdate = DateTime.Now,
                            id = Guid.NewGuid(),
                            deleted = false,
                            file = request.file[i],
                            fileDescription = request.fileName[i],
                            stockId = (Guid)stock.id,
                        });
                    }
                }

                await dbContext.SaveChangesAsync();

                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        [HttpPost("confirmStock")]
        public async Task<ApiResponse> ConfirmStock(ApiStockConfirmRequest request)
        {
            try
            {
                var stock = await dbContext.stocks
                    .SingleOrDefaultAsync(r => !r.deleted && r.id == request.stockId);


                if (stock != null)
                {
                    stock.id = request.stockId;
                    stock.confirmationDate = DateTime.Now;
                    stock.confirmStatus = request.confirmStatus;
                    stock.note = request.note;
                    stock.lastUpdate = DateTime.Now;
                    stock.confirmById = authService.UserClaims.objectSID;
                    stock.editedBy = authService.UserClaims.objectSID;

                    dbContext.Entry(stock).State = EntityState.Modified;
                }

                await dbContext.SaveChangesAsync();

                return ApiResponseErrorType.OK.CreateResponse();
            }
            catch (Exception e)
            {
                return (e.InnerException).Message.CreateResponse();
            }
        }

        #endregion

    }
}
