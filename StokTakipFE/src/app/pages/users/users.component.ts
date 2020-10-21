import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

import { BackendService } from 'src/app/services/backend.service';
import { ApiCompanyDefinitionResponse } from 'src/app/services/serviceClasses/ApiCompanyDefinitionResponse';
import { ApiCompanyDefinitionRequest } from 'src/app/services/serviceClasses/ApiCompanyDefinitionRequest';
import { ApiUserDefinitionResponse } from 'src/app/services/serviceClasses/ApiUserDefinitionResponse';
import { authorityLevel } from 'src/app/services/serviceClasses/authorityLevel';
import { RequiredOptionalFields } from 'src/app/helpers/validators';
import { PaginationResponse } from 'src/app/services/serviceClasses/PaginationResponse';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  Math = Math;
  modalHeader: string;
  fieldTextType = false;
  clearButton = true;
  saveUserEnabled = false;
  saveCompanyEnabled = false;
  setUserID: string;
  authorityLevel = authorityLevel;

  filterUserList: Observable<ApiUserDefinitionResponse[]> = of([]);
  filterUserList2: Observable<ApiUserDefinitionResponse[]> = of([]);
  userLists: ApiUserDefinitionResponse[] = [];
  companyLists: ApiCompanyDefinitionResponse[];
  filterCompanyLists: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  selectedUser: ApiUserDefinitionResponse;
  companyUser: ApiCompanyDefinitionRequest;

  searchUsers: FormControl = new FormControl();
  searchUser: FormControl = new FormControl();
  searchAdmin: FormControl = new FormControl();
  searchWarehouseWorker: FormControl = new FormControl();
  userFormGroup: FormGroup;
  companiesFormGroup: FormGroup;
  paginationFormGroup: FormGroup;
  responsePagination: Observable<any> = of({});
  page = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public backendService: BackendService,
    private spinner: NgxSpinnerService
  ) { }

  public get firstName(): FormControl { return this.userFormGroup.get('firstName') as FormControl; }
  public get displayName(): FormControl { return this.userFormGroup.get('displayName') as FormControl; }
  public get lastName(): FormControl { return this.userFormGroup.get('lastName') as FormControl; }
  public get password(): FormControl { return this.userFormGroup.get('password') as FormControl; }
  public get mobile(): FormControl { return this.userFormGroup.get('mobile') as FormControl; }
  public get telephoneNumber(): FormControl { return this.userFormGroup.get('telephoneNumber') as FormControl; }
  public get userPrincipalName(): FormControl { return this.userFormGroup.get('userPrincipalName') as FormControl; }
  public get department(): FormControl { return this.userFormGroup.get('department') as FormControl; }
  public get company(): FormControl { return this.userFormGroup.get('company') as FormControl; }
  public get birtOfDate(): FormControl { return this.userFormGroup.get('birtOfDate') as FormControl; }
  public get genus(): FormControl { return this.userFormGroup.get('genus') as FormControl; }
  public get about(): FormControl { return this.userFormGroup.get('about') as FormControl; }
  public get admin(): FormControl { return this.userFormGroup.get('admin') as FormControl; }
  public get user(): FormControl { return this.userFormGroup.get('user') as FormControl; }
  public get warehouseWorker(): FormControl { return this.userFormGroup.get('warehouseWorker') as FormControl; }

  public get pageNumber(): FormControl { return this.paginationFormGroup.get('page') as FormControl; }
  public get rowsPerPage(): FormControl { return this.paginationFormGroup.get('rowsPerPage') as FormControl; }

  public get name(): FormControl { return this.companiesFormGroup.get('name') as FormControl; }
  public get taxNo(): FormControl { return this.companiesFormGroup.get('taxNo') as FormControl; }
  public get address(): FormControl { return this.companiesFormGroup.get('address') as FormControl; }
  public get eposta(): FormControl { return this.companiesFormGroup.get('eposta') as FormControl; }
  public get phone(): FormControl { return this.companiesFormGroup.get('phone') as FormControl; }
  public get webSite(): FormControl { return this.companiesFormGroup.get('webSite') as FormControl; }
  public get deleted(): FormControl { return this.companiesFormGroup.get('deleted') as FormControl; }
  public get isShipping(): FormControl { return this.companiesFormGroup.get('isShipping') as FormControl; }

  public ngOnInit(): void {
    this.initUserForm();
    this.valueCahnges();
    this.getUsers();
    this.initCompaniesForm();
    const request = {
      page: this.pageNumber.value,
      rowCount: 10,
      rowsPerPage: this.rowsPerPage.value
    } as PaginationResponse;
    this.getUserList(request);
  }

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

  }

  public initUserForm(): void {
    this.paginationFormGroup = this.formBuilder.group({
      page: new FormControl(1),
      rowsPerPage: new FormControl(10)
    });

    this.userFormGroup = this.formBuilder.group({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      displayName: new FormControl(null, Validators.required),
      password: new FormControl(null),
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

    this.rowsPerPage.valueChanges.subscribe();
    this.paginationFormGroup.valueChanges
      .subscribe(_ => {
        const request = {
          page: this.pageNumber.value,
          rowCount: 10,
          rowsPerPage: this.rowsPerPage.value
        } as PaginationResponse;
        this.getUserList(request);
      });
  }

  public valueCahnges(): void {
    this.searchAdmin.valueChanges
      .subscribe(v => {
        if (v) {
          const filterProduct = this.userLists
            .map(
              item => {
                const com = new ApiUserDefinitionResponse(item);
                // tslint:disable-next-line:no-unused-expression
                com.department = com.department === 'Unassigned' || com.department === null ? 'Atanmamış' : com.department;
                if (com.thumbnailPhoto !== null) {
                  // tslint:disable-next-line:no-construct
                  const photo = new String('data:image/jpeg;base64,');
                  com.thumbnailPhoto = photo.concat(item.thumbnailPhoto);
                } else if (com.userPhoto !== null) {
                  com.thumbnailPhoto = com.userPhoto;
                } else {
                  com.thumbnailPhoto = '../../../assets/images/users/default.jpg';
                }
                return com;
              })
            // tslint:disable-next-line:no-bitwise
            .filter(r => (r.authorityLevel & this.authorityLevel.Admin) === this.authorityLevel.Admin);
          this.filterUserList2 = of(filterProduct);
        } else {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getUserList(request);
        }
      });

    this.searchWarehouseWorker.valueChanges
      .subscribe(v => {
        if (v) {
          const filterProduct = this.userLists
            .map(
              item => {
                const com = new ApiUserDefinitionResponse(item);
                // tslint:disable-next-line:no-unused-expression
                com.department = com.department === 'Unassigned' || com.department === null ? 'Atanmamış' : com.department;
                if (com.thumbnailPhoto !== null) {
                  // tslint:disable-next-line:no-construct
                  const photo = new String('data:image/jpeg;base64,');
                  com.thumbnailPhoto = photo.concat(item.thumbnailPhoto);
                } else if (com.userPhoto !== null) {
                  com.thumbnailPhoto = com.userPhoto;
                } else {
                  com.thumbnailPhoto = '../../../assets/images/users/default.jpg';
                }
                return com;
              })
            // tslint:disable-next-line:no-bitwise
            .filter(r => (r.authorityLevel & this.authorityLevel.WarehouseWorker) === this.authorityLevel.WarehouseWorker);
          this.filterUserList2 = of(filterProduct);
        } else {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getUserList(request);
        }
      });

    this.searchUser.valueChanges
      .subscribe(v => {
        if (v) {
          const filterProduct = this.userLists
            .map(
              item => {
                const com = new ApiUserDefinitionResponse(item);
                // tslint:disable-next-line:no-unused-expression
                com.department = com.department === 'Unassigned' || com.department === null ? 'Atanmamış' : com.department;
                if (com.thumbnailPhoto !== null) {
                  // tslint:disable-next-line:no-construct
                  const photo = new String('data:image/jpeg;base64,');
                  com.thumbnailPhoto = photo.concat(item.thumbnailPhoto);
                } else if (com.userPhoto !== null) {
                  com.thumbnailPhoto = com.userPhoto;
                } else {
                  com.thumbnailPhoto = '../../../assets/images/users/default.jpg';
                }
                return com;
              })
            // tslint:disable-next-line:no-bitwise
            .filter(r => (r.authorityLevel & this.authorityLevel.User) === this.authorityLevel.User);
          this.filterUserList2 = of(filterProduct);
        } else {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getUserList(request);
        }
      });

    this.searchUsers.valueChanges
      .subscribe(v => {
        this.filterUserList = of(
          this.userLists.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.filterUserList.subscribe();
        if (v && v instanceof Object && v.objectSid) {
          const filterProduct = this.userLists
            .map(
              item => {
                const com = new ApiUserDefinitionResponse(item);
                // tslint:disable-next-line:no-unused-expression
                com.department = com.department === 'Unassigned' || com.department === null ? 'Atanmamış' : com.department;
                if (com.thumbnailPhoto !== null) {
                  // tslint:disable-next-line:no-construct
                  const photo = new String('data:image/jpeg;base64,');
                  com.thumbnailPhoto = photo.concat(item.thumbnailPhoto);
                } else if (com.userPhoto !== null) {
                  com.thumbnailPhoto = com.userPhoto;
                } else {
                  com.thumbnailPhoto = '../../../assets/images/users/default.jpg';
                }
                return com;
              })
            .filter(r => r.objectSid === v.objectSid);
          this.filterUserList2 = of(filterProduct);
        }
        if (v === null || v === '') {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getUserList(request);
        }
      });

    this.company.valueChanges
      .subscribe(v => {
        this.filterCompanyLists = of(
          this.companyLists.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCompanyLists.subscribe();
      });
  }

  public onPageChange(evt): void {
    this.pageNumber.setValue(evt);
  }

  public getUsers(): void {
    this.backendService.getUsers()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.userLists = res.data;
          this.filterUserList = of(
            res.data.map(item => new ApiUserDefinitionResponse(item)));
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

  public getUserList(request: any): void {
    this.backendService.getCompanies()
      .subscribe(r => {
        if (r.error.code === 0) {
          this.companyLists = r.data;
          this.filterCompanyLists = of(r.data);
          this.backendService.getUserList(request)
            .subscribe(res => {
              if (res.error.code === 0) {
                this.responsePagination = of(res.pagination);
                this.filterUserList2 = of(
                  res.data.map(
                    item => {
                      const com = new ApiUserDefinitionResponse(item);
                      // tslint:disable-next-line:no-unused-expression
                      com.department = com.department === 'Unassigned' || com.department === null ? 'Atanmamış' : com.department;
                      if (com.thumbnailPhoto !== null) {
                        // tslint:disable-next-line:no-construct
                        const photo = new String('data:image/jpeg;base64,');
                        com.thumbnailPhoto = photo.concat(item.thumbnailPhoto);
                      } else if (com.userPhoto !== null) {
                        com.thumbnailPhoto = com.userPhoto;
                      } else {
                        com.thumbnailPhoto = '../../../assets/images/users/default.jpg';
                      }
                      return com;
                    }));
                if (this.setUserID !== undefined) {
                  const sUser = this.userLists.filter(v => v.objectSid === this.setUserID)[0];
                  this.searchUsers.setValue(sUser);
                } else {
                  const sUser = this.userLists.filter(v => v.userPrincipalName === this.userPrincipalName.value)[0];
                  this.searchUsers.setValue(sUser);
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
        } else {
          Swal.fire({
            title: r.error.message,
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

  public openUserModal(userModal, status: number, u: ApiUserDefinitionResponse): void {
    this.clearButton = true;
    this.firstName.enable({ emitEvent: false });
    this.lastName.enable({ emitEvent: false });
    this.displayName.enable({ emitEvent: false });
    this.password.enable({ emitEvent: false });
    this.mobile.enable({ emitEvent: false });
    this.telephoneNumber.enable({ emitEvent: false });
    this.userPrincipalName.enable({ emitEvent: false });
    this.genus.enable({ emitEvent: false });
    this.birtOfDate.enable({ emitEvent: false });
    this.company.enable({ emitEvent: false });
    this.department.enable({ emitEvent: false });
    this.about.enable({ emitEvent: false });
    this.admin.enable({ emitEvent: false });
    this.user.enable({ emitEvent: false });
    this.warehouseWorker.enable({ emitEvent: false });

    if (status === 1) {
      this.modalHeader = 'Kullanıcı Ekleme';
      this.firstName.setValue(null);
      this.lastName.setValue(null);
      this.displayName.setValue(null);
      this.password.setValidators(Validators.required);
      this.password.setValue(null);
      this.mobile.setValue(null);
      this.telephoneNumber.setValue(null);
      this.userPrincipalName.setValue(null);
      this.genus.setValue(null);
      this.birtOfDate.setValue(null);
      this.company.setValue(null);
      this.department.setValue(null);
      this.about.setValue(null);
    }

    if (status === 2) {
      this.modalHeader = 'Kullanıcı Düzenleme';
      this.selectedUser = u;
      this.firstName.setValue(u.firstName);
      this.lastName.setValue(u.lastName);
      this.displayName.setValue(u.displayName);
      this.password.setValue(u.password);
      this.mobile.setValue(u.mobile);
      this.telephoneNumber.setValue(u.telephoneNumber);
      this.userPrincipalName.setValue(u.userPrincipalName);
      if (u.genus !== null) {
        const userGenus = this.userLists.filter(v => v.objectSid === u.objectSid)[0];
        userGenus.genus === false ? this.genus.setValue(0) : this.genus.setValue(1);
      }
      this.birtOfDate.setValue(u.birtOfDate);
      const company = this.companyLists.filter(v => v.name === u.company)[0];
      this.company.setValue(company);
      this.department.setValue(u.department);
      this.about.setValue(u.about);
      this.setAuthorityLevel(u);
    }

    if (status === 3) {
      this.modalHeader = `${u.displayName} Bilgileri`;
      this.firstName.setValue(u.firstName);
      this.lastName.setValue(u.lastName);
      this.displayName.setValue(u.displayName);
      this.password.setValue(u.password);
      this.mobile.setValue(u.mobile);
      this.telephoneNumber.setValue(u.telephoneNumber);
      this.userPrincipalName.setValue(u.userPrincipalName);
      if (u.genus !== null) {
        const userGenus = this.userLists.filter(v => v.objectSid === u.objectSid)[0];
        userGenus.genus === false ? this.genus.setValue(0) : this.genus.setValue(1);
      }
      this.birtOfDate.setValue(u.birtOfDate);
      this.company.setValue(u.company);
      this.department.setValue(u.department);
      this.about.setValue(u.about);
      this.clearButton = false;
      this.firstName.disable({ emitEvent: false });
      this.lastName.disable({ emitEvent: false });
      this.displayName.disable({ emitEvent: false });
      this.password.disable({ emitEvent: false });
      this.mobile.disable({ emitEvent: false });
      this.telephoneNumber.disable({ emitEvent: false });
      this.userPrincipalName.disable({ emitEvent: false });
      this.genus.disable({ emitEvent: false });
      this.birtOfDate.disable({ emitEvent: false });
      this.company.disable({ emitEvent: false });
      this.department.disable({ emitEvent: false });
      this.about.disable({ emitEvent: false });
      this.admin.disable({ emitEvent: false });
      this.user.disable({ emitEvent: false });
      this.warehouseWorker.disable({ emitEvent: false });
      this.setAuthorityLevel(u);
    }
    this.modalService.open(userModal, { centered: true });
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
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: 10
          } as PaginationResponse;
          this.getUserList(request);
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
    data.company = this.company.value;
    data.accountName = this.userPrincipalName.value.split('@')[0];
    if (this.selectedUser !== undefined) {
      this.setUserID = this.selectedUser.objectSid;
      data.objectSid = this.selectedUser.objectSid;
      data.thumbnailPhoto = this.selectedUser.thumbnailPhoto;
      data.userPhoto = this.selectedUser.userPhoto;
    }
    data.authorityLevel = (
      (this.admin.value ? (this.admin.disabled ? 0 : this.authorityLevel.Admin) : 0) + (
        this.user.value ? (this.user.disabled ? 0 : this.authorityLevel.User) : 0) + (
        this.warehouseWorker.value ? (this.warehouseWorker.disabled ? 0 : this.authorityLevel.WarehouseWorker) : 0)
    );
    this.spinner.show();
    this.backendService.saveUser(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getUserList(request);
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

  public deleteUser(u: ApiUserDefinitionResponse): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Silinen Kullanıcı Geri Alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.value) {
        this.userFormGroup.markAllAsTouched();
        this.firstName.setValue(u.firstName);
        this.lastName.setValue(u.lastName);
        this.displayName.setValue(u.displayName);
        this.password.setValue(u.password);
        this.mobile.setValue(u.mobile);
        this.telephoneNumber.setValue(u.telephoneNumber);
        this.userPrincipalName.setValue(u.userPrincipalName);
        const userGenus = this.userLists.filter(v => v.objectSid === u.objectSid)[0];
        userGenus.genus === false ? this.genus.setValue(0) : this.genus.setValue(1);
        this.birtOfDate.setValue(u.birtOfDate);
        this.department.setValue(u.department);
        this.about.setValue(u.about);
        this.companyUser = this.companyLists.filter(r => r.name === u.company)[0];
        this.company.setValue(this.companyUser);
        this.setAuthorityLevel(u);
        if (!this.userFormGroup.valid) {
          Swal.fire({
            title: 'Lütfen Gerekli Alanları Doldurunuz...',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#3fc3ee',
            icon: 'info'
          });
          return;
        }
        const data = this.userFormGroup.getRawValue();
        data.deleted = true;
        data.objectSid = u.objectSid;
        this.backendService.saveUser(data)
          .subscribe(res => {
            if (res.error.code === 0) {
              const request = {
                page: this.pageNumber.value,
                rowCount: 10,
                rowsPerPage: this.rowsPerPage.value
              } as PaginationResponse;
              this.getUserList(request);
              this.getUsers();
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
              Swal.fire({
                title: res.error.message,
                confirmButtonText: 'Kapat',
                confirmButtonColor: '#d33',
                icon: 'error'
              });
            }
          }, err => {
            this.spinner.hide();
            Swal.fire({
              title: err,
              confirmButtonText: 'Kapat',
              confirmButtonColor: '#d33',
              icon: 'error'
            });
          });
      }
    });
  }

  public setAuthorityLevel(u: ApiUserDefinitionResponse): void {
    // tslint:disable-next-line:no-bitwise
    this.user.setValue((u.authorityLevel & this.authorityLevel.User) === this.authorityLevel.User);
    // tslint:disable-next-line:no-bitwise
    this.admin.setValue((u.authorityLevel & this.authorityLevel.Admin) === this.authorityLevel.Admin);
    // tslint:disable-next-line:no-bitwise
    this.warehouseWorker.setValue((u.authorityLevel & this.authorityLevel.WarehouseWorker) === this.authorityLevel.WarehouseWorker);
  }

  public selectProperty(propertyName: any): (o: any) => string | undefined {
    return (o: any) => (o || {})[propertyName];
  }
}
