import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

import { BackendService } from 'src/app/services/backend.service';
import { ApiProjectDefinitionResponse } from 'src/app/services/serviceClasses/ApiProjectDefinitionResponse';
import { Observable, of } from 'rxjs';
import { ApiCompanyDefinitionResponse } from 'src/app/services/serviceClasses/ApiCompanyDefinitionResponse';
import { ApiProfileDefinitionResponse } from 'src/app/services/serviceClasses/ApiProfileDefinitionResponse';
import { ApiProductDefinitionResponse } from 'src/app/services/serviceClasses/ApiProductDefinitionResponse';
import { ApiSubCategoryDefinitionResponse } from 'src/app/services/serviceClasses/ApiSubCategoryDefinitionResponse';
import { ApiCompanyUserResponse } from 'src/app/services/serviceClasses/ApiCompanyUserResponse';
import { RequiredOptionalFields } from 'src/app/helpers/validators';
import { ApiCategoryDefinitionResponse } from 'src/app/services/serviceClasses/ApiCategoryDefinitionResponse';
import { authorityLevel } from 'src/app/services/serviceClasses/authorityLevel';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})

export class StockComponent implements OnInit {
  modalHeader: string;
  notesBase64Files: string[] = [];
  fieldTextType = false;
  saveProjectEnabled = false;
  saveCompanyEnabled = false;
  saveProductEnabled = false;
  saveUserEnabled = false;
  saveStockEnabled = false;
  saveSubCategoryEnabled = false;
  shippingCompany = false;
  saveStockProduct = true;
  authorityLevel = authorityLevel;

  filterCategoryList: Observable<ApiCategoryDefinitionResponse[]> = of([]);
  categoryList: ApiCategoryDefinitionResponse[] = [];
  filterCompanyListIn: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  filterCompanyListOut: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  filterCompanyListProjectModal: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  filterCompanyListUserModal: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  filterShippingCompanyList: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  companyList: ApiCompanyDefinitionResponse[] = [];
  filterProductList: Observable<ApiProductDefinitionResponse[]> = of([]);
  productList: ApiProductDefinitionResponse[] = [];
  companyUserList: Observable<ApiCompanyUserResponse[]> = of([]);
  compUserList: ApiCompanyUserResponse[] = [];
  userCompanyList: ApiCompanyDefinitionResponse[] = [];
  filterSubCategoryListProdutModal: Observable<ApiCategoryDefinitionResponse[]> = of([]);
  filterSubCategoryList: Observable<ApiSubCategoryDefinitionResponse[]> = of([]);
  filterProjectList: Observable<ApiProjectDefinitionResponse[]> = of([]);
  projectList: ApiProjectDefinitionResponse[] = [];

  filterUserList: Observable<ApiProfileDefinitionResponse[]> = of([]);
  filterUserListR: Observable<ApiProfileDefinitionResponse[]> = of([]);
  filterUserListG: Observable<ApiProfileDefinitionResponse[]> = of([]);
  filterUserList2: Observable<ApiProfileDefinitionResponse[]> = of([]);
  userList: ApiProfileDefinitionResponse[] = [];

  deliveryMethod: FormControl = new FormControl();
  stockFormGroup: FormGroup;
  productFormGroup: FormGroup;
  companiesFormGroup: FormGroup;
  userFormGroup: FormGroup;
  projectFormGroup: FormGroup;
  subCategoryFormGroup: FormGroup;
  rows: FormArray;
  itemRows: FormControl;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public backendService: BackendService,
    private spinner: NgxSpinnerService
  ) { }

  // Stock Get Methods
  public get invoiceNo(): FormControl { return this.stockFormGroup.get('invoiceNo') as FormControl; }
  public get projectId(): FormArray { return this.stockFormGroup.get('projectId') as FormArray; }
  public get incomingCompanyId(): FormControl { return this.stockFormGroup.get('incomingCompanyId') as FormControl; }
  public get outgoingCompanyId(): FormControl { return this.stockFormGroup.get('outgoingCompanyId') as FormControl; }
  public get shippingCompanyId(): FormControl { return this.stockFormGroup.get('shippingCompanyId') as FormControl; }
  public get shippingUserId(): FormControl { return this.stockFormGroup.get('shippingUserId') as FormControl; }
  public get productRows(): FormArray { return this.stockFormGroup.get('productRows') as FormArray; }
  public get date(): FormArray { return this.stockFormGroup.get('date') as FormArray; }
  public get receiverId(): FormArray { return this.stockFormGroup.get('receiverId') as FormArray; }
  public get deliveryPersonId(): FormArray { return this.stockFormGroup.get('deliveryPersonId') as FormArray; }
  public get stockDeleted(): FormArray { return this.stockFormGroup.get('deleted') as FormArray; }
  public get files(): FormArray { return this.stockFormGroup.get('file') as FormArray; }
  public get _fileTitles(): FormArray { return this.stockFormGroup.get('fileName') as FormArray; }

  // Product Get Methods
  public get category(): FormControl { return this.productFormGroup.get('category') as FormControl; }
  public get productName(): FormControl { return this.productFormGroup.get('name') as FormControl; }
  public get genus(): FormControl { return this.productFormGroup.get('genus') as FormControl; }
  public get criticalLevel(): FormControl { return this.productFormGroup.get('criticalLevel') as FormControl; }
  public get inStock(): FormControl { return this.productFormGroup.get('inStock') as FormControl; }

  // Company Get Methods
  public get name(): FormControl { return this.companiesFormGroup.get('name') as FormControl; }
  public get taxNo(): FormControl { return this.companiesFormGroup.get('taxNo') as FormControl; }
  public get address(): FormControl { return this.companiesFormGroup.get('address') as FormControl; }
  public get eposta(): FormControl { return this.companiesFormGroup.get('eposta') as FormControl; }
  public get phone(): FormControl { return this.companiesFormGroup.get('phone') as FormControl; }
  public get webSite(): FormControl { return this.companiesFormGroup.get('webSite') as FormControl; }
  public get deleted(): FormControl { return this.companiesFormGroup.get('deleted') as FormControl; }

  // User Get Methods
  public get firstName(): FormControl { return this.userFormGroup.get('firstName') as FormControl; }
  public get displayName(): FormControl { return this.userFormGroup.get('displayName') as FormControl; }
  public get lastName(): FormControl { return this.userFormGroup.get('lastName') as FormControl; }
  public get password(): FormControl { return this.userFormGroup.get('password') as FormControl; }
  public get mobile(): FormControl { return this.userFormGroup.get('mobile') as FormControl; }
  public get telephoneNumber(): FormControl { return this.userFormGroup.get('telephoneNumber') as FormControl; }
  public get userPrincipalName(): FormControl { return this.userFormGroup.get('userPrincipalName') as FormControl; }
  public get department(): FormControl { return this.userFormGroup.get('department') as FormControl; }
  public get companyUser(): FormControl { return this.userFormGroup.get('company') as FormControl; }
  public get birtOfDate(): FormControl { return this.userFormGroup.get('birtOfDate') as FormControl; }
  public get userGenus(): FormControl { return this.userFormGroup.get('genus') as FormControl; }
  public get about(): FormControl { return this.userFormGroup.get('about') as FormControl; }
  public get admin(): FormControl { return this.userFormGroup.get('admin') as FormControl; }
  public get user(): FormControl { return this.userFormGroup.get('user') as FormControl; }
  public get warehouseWorker(): FormControl { return this.userFormGroup.get('warehouseWorker') as FormControl; }

  // Project Get Methods
  public get projectCompanyId(): FormControl { return this.projectFormGroup.get('companyId') as FormControl; }
  public get projectName(): FormControl { return this.projectFormGroup.get('projectName') as FormControl; }
  public get givenManager(): FormControl { return this.projectFormGroup.get('givenManager') as FormControl; }
  public get receivedManager(): FormControl { return this.projectFormGroup.get('receivedManager') as FormControl; }

  // SubCategory Get Methods
  public get parentId(): FormControl { return this.subCategoryFormGroup.get('parentId') as FormControl; }
  public get subCategory(): FormControl { return this.subCategoryFormGroup.get('subCategory') as FormControl; }
  public get subCategoryDeleted(): FormControl { return this.subCategoryFormGroup.get('deleted') as FormControl; }


  public ngOnInit(): void {
    this.initStockForm();
    this.initProductForm();
    this.initCompaniesForm();
    this.initCompaniesForm();
    this.initUserForm();
    this.initProjectForm();
    this.initSubCategoryForm();
    this.getProjects();
    this.getCompanies();
    this.getUsers();
    this.getProducts();
    this.getSubCategories();
    this.getUserCompany(this.backendService.currentUser().objectSid);

  }

  public initStockForm(): void {
    this.stockFormGroup = this.formBuilder.group({
      invoiceNo: new FormControl(null, Validators.required),
      projectId: new FormControl(null, Validators.required),
      incomingCompanyId: new FormControl(null, Validators.required),
      outgoingCompanyId: new FormControl(null, Validators.required),
      shippingCompanyId: new FormControl(null),
      shippingUserId: new FormControl(null),
      productRows: new FormArray([], Validators.required),
      date: new FormControl(new Date(), Validators.required),
      receiverId: new FormControl(null, Validators.required),
      deleted: new FormControl(false),
      deliveryPersonId: new FormControl(this.backendService.currentUser().objectSid, Validators.required),
      file: this.formBuilder.array([] as File[]),
      fileName: this.formBuilder.array([] as string[]),
    });

    this.deliveryMethod.valueChanges
      .subscribe(v => {
        if (v) {
          this.shippingCompany = true;
        } else {
          this.shippingCompany = false;
        }
      });

    this.shippingCompanyId.valueChanges
      .subscribe(v => {
        if (v && v instanceof Object && v.id) {
          this.getCompanyUser(v.id);
        }
      });
  }

  public saveStock(): void {
    if (!this.stockFormGroup.valid) {
      Swal.fire({
        title: 'Lütfen Gerekli Alanları Doldurunuz',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#3fc3ee',
        icon: 'info'
      });
      return;
    }
    this.saveStockEnabled = true;
    const data = this.stockFormGroup.getRawValue();
    if (this.backendService.currentUser().isUser) {
      data.productRows.forEach(item => {
        if (item.productName.inStock < item.quantity) {
          Swal.fire({
            title: 'Miktar Stokta Bulunan Ürün Sayısından Fazla Olamaz. '.concat(`\nÜrün : ${item.productName.name} \n Stok Sayısı : ${item.productName.inStock}`),
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#3fc3ee',
            icon: 'info'
          });
          this.saveStockProduct = false;
        } else {
          this.saveStockProduct = true;
        }
      });
    }
    data.deliveryPersonId = this.backendService.currentUser().objectSid;
    data.incomingCompanyId = this.incomingCompanyId.value.id;
    data.outgoingCompanyId = this.outgoingCompanyId.value.id;
    data.projectId = this.projectId.value.id;
    data.receiverId = this.receiverId.value.objectSid;
    if (this.shippingCompany === true) {
      data.shippingCompanyId = this.shippingCompanyId.value.id;
      data.shippingUserId = this.shippingUserId.value.id;
    }
    this.spinner.show();
    if (this.saveStockProduct) {
      this.backendService.saveStock(data)
        .subscribe(res => {
          if (res.error.code === 0) {
            this.modalService.dismissAll();
            this.initStockForm();
            this.saveStockEnabled = false;
            this.spinner.hide();
            Swal.fire({
              title: 'Kayıt Başarılı',
              position: 'center',
              timer: 1200,
              icon: 'success',
              showConfirmButton: false
            });
          } else {
            this.spinner.hide();
            this.saveStockEnabled = false;
            Swal.fire({
              title: res.error.message,
              confirmButtonText: 'Kapat',
              confirmButtonColor: '#d33',
              icon: 'error'
            });
          }
        }, err => {
          this.spinner.hide();
          this.saveStockEnabled = false;
          Swal.fire({
            title: err,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        });
    } else {
      this.spinner.hide();
      this.saveStockEnabled = false;
    }
  }

  // Project Methods

  public initProjectForm(): void {
    this.projectFormGroup = this.formBuilder.group({
      name: new FormControl(null, Validators.required),
      companyId: new FormControl(null, Validators.required),
      givenManager: new FormControl(null, Validators.required),
      receivedManager: new FormControl(null, Validators.required),
      deleted: new FormControl(false, Validators.required),
    });

    this.projectCompanyId.valueChanges
      .subscribe(v => {
        this.filterCompanyListProjectModal = of(
          this.companyList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCompanyListProjectModal.subscribe();
        if (v && v instanceof Object && v.id) {
          const userCompanyId = this.companyList.filter(r => r.id === v.id)[0].id;
          this.getCompanyUser(userCompanyId);
        }
      });

    this.receivedManager.valueChanges
      .subscribe(v => {
        this.filterUserList2 = of(
          this.userList.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.filterUserList2.subscribe();
      });

    this.givenManager.valueChanges
      .subscribe(v => {
        this.companyUserList = of(
          this.compUserList.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.companyUserList.subscribe();
      });

    this.projectId.valueChanges
      .subscribe(v => {
        this.filterProjectList = of(
          this.projectList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterProjectList.subscribe();
      });
  }

  public openProjectModal(projectModal, status: number): void {

    if (status === 1) {
      this.modalHeader = 'Proje Ekleme';
      this.name.setValue(null);
      this.givenManager.setValue(null);
      this.receivedManager.setValue(null);
      this.projectCompanyId.setValue(null);
    }
    this.modalService.open(projectModal, { centered: true });
  }

  public getUserCompany(userId: string): void {
    this.backendService.getUserCompany(userId)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.userCompanyList = res.data;
          if (this.backendService.currentUser().isWarehouseWorker) {
            this.outgoingCompanyId.setValue(this.userCompanyList[0]);
            this.outgoingCompanyId.disable({ emitEvent: false });
          } else {
            this.outgoingCompanyId.enable({ emitEvent: false });
          }
          if (this.backendService.currentUser().isUser) {
            this.incomingCompanyId.setValue(this.userCompanyList[0]);
            this.incomingCompanyId.disable({ emitEvent: false });
          } else {
            this.incomingCompanyId.enable({ emitEvent: false });
          }
          if (this.backendService.currentUser().isUser && this.backendService.currentUser().isWarehouseWorker) {
            this.outgoingCompanyId.setValue(null);
            this.incomingCompanyId.setValue(null);
            this.incomingCompanyId.enable({ emitEvent: false });
            this.outgoingCompanyId.enable({ emitEvent: false });
          }
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  public getCompanyUser(companyuserId: string): void {
    this.backendService.getCompanyUser(companyuserId)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.compUserList = res.data;
          this.companyUserList = of(res.data);
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  public getProjects(): void {
    this.backendService.getProjects()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.projectList = res.data;
          this.filterProjectList = of(
            res.data.map(
              item => new ApiProjectDefinitionResponse(item)));
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });

  }

  public saveProject(): void {
    if (!this.projectFormGroup.valid) {
      Swal.fire({
        title: 'Lütfen Gerekli Alanları Doldurunuz...',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#3fc3ee',
        icon: 'info'
      });
      return;
    }
    this.saveProjectEnabled = true;
    const data = this.projectFormGroup.getRawValue();
    data.givenManager = this.givenManager.value.objectSid;
    data.receivedManager = this.receivedManager.value.objectSid;
    data.companyId = this.projectCompanyId.value.id;

    this.spinner.show();
    this.backendService.saveProject(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.getProjects();
          this.modalService.dismissAll();
          this.saveProjectEnabled = false;
          this.spinner.hide();
          Swal.fire({
            title: 'Kayıt Başarılı',
            position: 'center',
            timer: 1200,
            icon: 'success',
            showConfirmButton: false
          });
        } else {
          this.spinner.hide();
          this.saveProjectEnabled = false;
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        this.spinner.hide();
        this.saveProjectEnabled = false;
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  // End Project Method

  // Company Methods

  public initCompaniesForm(): void {
    this.companiesFormGroup = this.formBuilder.group({
      name: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      taxNo: new FormControl(null, [Validators.minLength(10), Validators.maxLength(10)]),
      address: new FormControl(null, Validators.required),
      eposta: new FormControl(null, [Validators.email]),
      phone: new FormControl(null, [Validators.required, Validators.maxLength(11)]),
      webSite: new FormControl(null),
      deleted: new FormControl(false, Validators.required),
      isShipping: new FormControl(false, Validators.required),
    });

    this.incomingCompanyId.valueChanges
      .subscribe(v => {
        this.filterCompanyListIn = of(
          this.companyList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCompanyListIn.subscribe();
      });

    this.outgoingCompanyId.valueChanges
      .subscribe(v => {
        this.filterCompanyListOut = of(
          this.companyList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCompanyListOut.subscribe();
      });

    this.receiverId.valueChanges
      .subscribe(v => {
        this.filterUserList = of(
          this.userList.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.filterUserList.subscribe();
      });

    this.shippingUserId.valueChanges
      .subscribe(v => {
        this.companyUserList = of(
          this.compUserList.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.companyUserList.subscribe();
      });

    this.shippingCompanyId.valueChanges
      .subscribe(v => {
        this.filterShippingCompanyList = of(
          this.companyList.filter(r => r.isShipping === true).filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterShippingCompanyList.subscribe();
      });

  }

  public openCompanyModal(companyModal, status: number): void {

    if (status === 1) {
      this.modalService.dismissAll();
      this.modalHeader = 'Firma Ekleme';
      this.name.setValue(null);
      this.taxNo.setValue(null);
      this.address.setValue(null);
      this.eposta.setValue(null);
      this.phone.setValue(null);
      this.webSite.setValue(null);
    }

    this.modalService.open(companyModal, { centered: true });
  }

  public getCompanies(): void {
    this.backendService.getCompanies()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.companyList = res.data;
          this.filterShippingCompanyList = of(res.data.filter(r => r.isShipping === true));
          this.filterCompanyListIn = of(
            res.data.map(
              item => new ApiCompanyDefinitionResponse(item))
              .sort((item1, item2) => item1.name.localeCompare(item2.name)));
          this.filterCompanyListOut = this.filterCompanyListIn;
          this.filterCompanyListProjectModal = this.filterCompanyListIn;
          this.filterCompanyListUserModal = this.filterCompanyListIn;
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  public saveCompany(): void {
    if (!this.companiesFormGroup.valid) {
      Swal.fire({
        title: 'Lütfen Gerekli Alanları Doldurunuz...',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#3fc3ee',
        icon: 'info'
      });
      return;
    }
    this.saveCompanyEnabled = true;
    const data = this.companiesFormGroup.getRawValue();
    this.spinner.show();
    this.backendService.saveCompany(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.getCompanies();
          this.modalService.dismissAll();
          this.saveCompanyEnabled = false;
          this.spinner.hide();
          Swal.fire({
            title: 'Kayıt Başarılı',
            position: 'center',
            timer: 1200,
            icon: 'success',
            showConfirmButton: false
          });
        } else {
          this.spinner.hide();
          this.saveCompanyEnabled = false;
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        this.spinner.hide();
        this.saveCompanyEnabled = false;
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  // End Company Method

  // Product Methods

  public initProductForm(): void {
    this.productFormGroup = this.formBuilder.group({
      category: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      genus: new FormControl(null, Validators.required),
      criticalLevel: new FormControl(10, Validators.required),
      deleted: new FormControl(false, Validators.required),
      inStock: new FormControl(null, Validators.required)
    });

  }

  public openProductModal(productModal, status: number): void {
    if (status === 1) {
      this.modalService.dismissAll();
      this.modalHeader = 'Ürün Ekleme';
      this.category.setValue(null);
      this.productName.setValue(null);
      this.genus.setValue(null);
      this.inStock.setValue(null);
    }

    this.modalService.open(productModal, { centered: true });
  }

  public getProducts(): void {
    this.backendService.getProducts()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.productList = res.data;
          this.filterProductList = of(
            res.data.map(item => new ApiProductDefinitionResponse(item)).filter(r => r.inStock > 0)
          );
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });

  }

  public onAddProductRow(): void {
    this.productRows.push(this.createProductItem());
  }

  public onRemoveProductRow(rowIndex: number): void {
    this.productRows.removeAt(rowIndex);
  }

  public createProductItem(): FormGroup {
    return this.formBuilder.group({
      serialNo: [null, Validators.required],
      productName: [null, Validators.required],
      quantity: [null, Validators.required],
      department: [null, Validators.required]
    });
  }

  public saveProduct(): void {
    if (!this.productFormGroup.valid) {
      Swal.fire({
        title: 'Lütfen Gerekli Alanları Doldurunuz...',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#3fc3ee',
        icon: 'info'
      });
      return;
    }
    this.saveProductEnabled = true;
    const data = this.productFormGroup.getRawValue();
    data.categoryId = this.category.value.id;

    this.spinner.show();
    this.backendService.saveProduct(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.getProducts();
          this.modalService.dismissAll();
          this.saveProductEnabled = false;
          this.spinner.hide();
          Swal.fire({
            title: 'Kayıt Başarılı',
            position: 'center',
            timer: 1200,
            icon: 'success',
            showConfirmButton: false
          });
        } else {
          this.spinner.hide();
          this.saveProductEnabled = false;
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        this.spinner.hide();
        this.saveProductEnabled = false;
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  // End Product Method

  // User Methods

  public initUserForm(): void {
    this.userFormGroup = this.formBuilder.group({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      displayName: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required),
      mobile: new FormControl(),
      telephoneNumber: new FormControl(),
      userPrincipalName: new FormControl(null, Validators.required),
      department: new FormControl(null, Validators.required),
      company: new FormControl(null, Validators.required),
      birtOfDate: new FormControl(),
      image: new FormControl(),
      genus: new FormControl(null, Validators.required),
      about: new FormControl(null),
      admin: new FormControl(false, Validators.required),
      user: new FormControl(false, Validators.required),
      warehouseWorker: new FormControl(false),
    });

    this.companyUser.valueChanges
      .subscribe(v => {
        this.filterCompanyListUserModal = of(
          this.companyList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCompanyListUserModal.subscribe();
      });

    this.deliveryPersonId.valueChanges
      .subscribe(v => {
        this.filterUserListG = of(
          this.userList.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.filterUserListG.subscribe();
      });
  }

  public openUserModal(userModal, status: number): void {

    if (status === 1) {
      this.modalService.dismissAll();
      this.modalHeader = 'Kullanıcı Ekleme';
      this.firstName.setValue(null);
      this.lastName.setValue(null);
      this.displayName.setValue(null);
      this.password.setValue(null);
      this.mobile.setValue(null);
      this.telephoneNumber.setValue(null);
      this.userPrincipalName.setValue(null);
      this.genus.setValue(null);
      this.birtOfDate.setValue(null);
      this.companyUser.setValue(null);
      this.department.setValue(null);
      this.about.setValue(null);
    }

    this.modalService.open(userModal, { centered: true });
  }

  public getUsers(): void {
    this.backendService.getUsers()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.userList = res.data;
          this.filterUserList = of(
            res.data.map(
              item => new ApiProfileDefinitionResponse(item)));
          this.filterUserList2 = this.filterUserList;
          this.filterUserListR = this.filterUserList;
          this.filterUserListG = this.filterUserList;
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });

  }

  public toggleFieldTextType(): void {
    this.fieldTextType = !this.fieldTextType;
  }

  public saveUser(): void {
    if (!this.userFormGroup.valid) {
      Swal.fire({
        title: 'Lütfen Gerekli Alanları Doldurunuz',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#3fc3ee',
        icon: 'info'
      });
      return;
    }
    this.saveUserEnabled = true;
    const data = this.userFormGroup.getRawValue();
    data.company = this.companyUser.value;
    data.accountName = this.userPrincipalName.value.split('@')[0];

    data.authorityLevel = (
      (this.admin.value ? (this.admin.disabled ? 0 : this.authorityLevel.Admin) : 0) + (
        this.user.value ? (this.user.disabled ? 0 : this.authorityLevel.User) : 0) + (
        this.warehouseWorker.value ? (this.warehouseWorker.disabled ? 0 : this.authorityLevel.WarehouseWorker) : 0)
    );
    this.spinner.show();
    this.backendService.saveUser(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.getUsers();
          this.modalService.dismissAll();
          this.saveUserEnabled = false;
          this.spinner.hide();
          Swal.fire({
            title: 'Kayıt Başarılı',
            position: 'center',
            timer: 1200,
            icon: 'success',
            showConfirmButton: false
          });
        } else {
          this.spinner.hide();
          this.saveUserEnabled = false;
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        this.spinner.hide();
        this.saveUserEnabled = false;
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  // End User Method

  // Category and SubCategory Methods

  public initSubCategoryForm(): void {
    this.subCategoryFormGroup = this.formBuilder.group({
      parentId: new FormControl(null, Validators.required),
      subCategory: new FormControl(null, Validators.required),
      type: new FormControl(1, Validators.required),
      deleted: new FormControl(false, Validators.required)
    });

    this.parentId.valueChanges
      .subscribe(v => {
        this.filterCategoryList = of(
          this.categoryList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCategoryList.subscribe();
      });
  }

  public openSubCategoryModal(subCategoryModal, status: number): void {
    this.getCategory();
    if (status === 1) {
      this.modalService.dismissAll();
      this.modalHeader = 'Alt Kategori Ekleme';
      this.subCategory.setValue(null);
      this.parentId.setValue(null);
    }
    this.modalService.open(subCategoryModal, { centered: true });
  }

  public getSubCategories(): void {
    this.backendService.getSubCategories()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.filterSubCategoryList = of(res.data
            .map(item => new ApiSubCategoryDefinitionResponse(item)));
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  public getSubCategory(): void {
    this.backendService.getSubCategoryList()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.filterSubCategoryListProdutModal = of(res.data.map(item => new ApiCategoryDefinitionResponse(item)));
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  public getCategory(): void {
    this.backendService.getCategories()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.categoryList = res.data;
          this.filterCategoryList = of(
            res.data.map(
              item => new ApiCategoryDefinitionResponse(item))
              .sort((item1, item2) => item1.name.localeCompare(item2.name)));
        } else {
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });

  }

  public saveSubCategory(): void {
    this.subCategoryFormGroup.markAllAsTouched();
    if (!this.subCategoryFormGroup.valid) {
      Swal.fire({
        title: 'Lütfen Gerekli Alanları Doldurunuz...',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#3fc3ee',
        icon: 'info'
      });
      return;
    }
    this.saveSubCategoryEnabled = true;
    const data = this.subCategoryFormGroup.getRawValue();

    data.parentId = this.parentId.value.id;
    data.name = this.subCategory.value;
    this.spinner.show();
    this.backendService.saveCategory(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.getSubCategories();
          this.modalService.dismissAll();
          this.spinner.hide();
          this.saveSubCategoryEnabled = false;
          Swal.fire({
            title: 'Kayıt Başarılı',
            position: 'center',
            timer: 1200,
            icon: 'success',
            showConfirmButton: false
          });
        } else {
          this.spinner.hide();
          this.saveSubCategoryEnabled = false;
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        this.saveSubCategoryEnabled = false;
        this.spinner.hide();
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }


  // End Category and SubCategory Method

  public fileAdded(evt): void {
    Promise.all(
      evt.addedFiles.map(f => {
        this.files.push(this.formBuilder.control(f));
        this._fileTitles.push(this.formBuilder.control(null, Validators.required));
        return new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(reader.result as string);
          reader.readAsDataURL(f);
        });
      })
    ).then(ps => {
      ps.forEach(b64 => this.notesBase64Files.push(b64 as string));
    });
  }

  public fileRemoved(evt): void {
    this.files.removeAt(evt);
    this._fileTitles.removeAt(evt);
    this.notesBase64Files.splice(evt, 1);
  }

  public openFileModal(fileAdd): void {
    this.modalHeader = 'Dosya Ekleme';
    this.modalService.open(fileAdd, { centered: true });
  }

  public selectProperty(propertyName: string): (o: any) => string | undefined {
    return (o: any) => (o || {})[propertyName];
  }
}
