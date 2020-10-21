import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

import { BackendService } from 'src/app/services/backend.service';
import { ApiCompanyDefinitionResponse } from 'src/app/services/serviceClasses/ApiCompanyDefinitionResponse';
import { ApiProjectDefinitionResponse } from 'src/app/services/serviceClasses/ApiProjectDefinitionResponse';
import { ApiProfileDefinitionResponse } from 'src/app/services/serviceClasses/ApiProfileDefinitionResponse';
import { ApiCompanyUserResponse } from 'src/app/services/serviceClasses/ApiCompanyUserResponse';
import { RequiredOptionalFields } from 'src/app/helpers/validators';
import { authorityLevel } from 'src/app/services/serviceClasses/authorityLevel';
import { PaginationResponse } from 'src/app/services/serviceClasses/PaginationResponse';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  Math = Math;
  modalHeader: string;
  setProjectID: string;
  fieldTextType = false;
  saveProjectEnabled = false;
  saveCompanyEnabled = false;
  saveUserEnabled = false;

  authorityLevel = authorityLevel;

  filterCompanyLists: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  filterCompanyListsUserModal: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  companyLists: ApiCompanyDefinitionResponse[];
  searchProjectList: Observable<ApiProjectDefinitionResponse[]> = of([]);
  filterProjectList: Observable<ApiProjectDefinitionResponse[]> = of([]);
  filterProjectList2: Observable<ApiProjectDefinitionResponse[]> = of([]);
  projectListRes: Observable<ApiProjectDefinitionResponse[]> = of([]);
  filterUsersList: Observable<ApiProfileDefinitionResponse[]> = of([]);
  filterUsersList2: Observable<ApiProfileDefinitionResponse[]> = of([]);
  projectList: ApiProjectDefinitionResponse[] = [];

  usersList: ApiProfileDefinitionResponse[] = [];
  selectedProject: ApiProjectDefinitionResponse;
  companyUserList: Observable<ApiCompanyUserResponse[]> = of([]);

  userFormGroup: FormGroup;
  companiesFormGroup: FormGroup;
  projectFormGroup: FormGroup;
  searchProjects: FormControl = new FormControl();
  paginationFormGroup: FormGroup;
  responsePagination: Observable<any> = of({});
  page = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public backendService: BackendService,
    private spinner: NgxSpinnerService
  ) { }
  // Project Get Merhods
  public get name(): FormControl { return this.projectFormGroup.get('name') as FormControl; }
  public get companyId(): FormControl { return this.projectFormGroup.get('companyId') as FormControl; }
  public get givenManager(): FormControl { return this.projectFormGroup.get('givenManager') as FormControl; }
  public get receivedManager(): FormControl { return this.projectFormGroup.get('receivedManager') as FormControl; }
  public get deleted(): FormControl { return this.projectFormGroup.get('deleted') as FormControl; }

  // Company Get Merhods
  public get companyName(): FormControl { return this.companiesFormGroup.get('name') as FormControl; }
  public get taxNo(): FormControl { return this.companiesFormGroup.get('taxNo') as FormControl; }
  public get address(): FormControl { return this.companiesFormGroup.get('address') as FormControl; }
  public get eposta(): FormControl { return this.companiesFormGroup.get('eposta') as FormControl; }
  public get phone(): FormControl { return this.companiesFormGroup.get('phone') as FormControl; }
  public get webSite(): FormControl { return this.companiesFormGroup.get('webSite') as FormControl; }
  public get companyDeleted(): FormControl { return this.companiesFormGroup.get('deleted') as FormControl; }
  public get isShipping(): FormControl { return this.companiesFormGroup.get('isShipping') as FormControl; }

  // User Get Merhods
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

  public ngOnInit(): void {
    this.initProjectForm();
    this.initCompaniesForm();
    this.getProjects();
    this.initUserForm();

    const request = {
      page: this.pageNumber.value,
      rowCount: 10,
      rowsPerPage: this.rowsPerPage.value
    } as PaginationResponse;
    this.getProjectList(request);
  }

  public initProjectForm(): void {
    this.paginationFormGroup = this.formBuilder.group({
      page: new FormControl(1),
      rowsPerPage: new FormControl(10)
    });

    this.projectFormGroup = this.formBuilder.group({
      name: new FormControl(null, Validators.required),
      companyId: new FormControl(null, Validators.required),
      givenManager: new FormControl(null, Validators.required),
      receivedManager: new FormControl(null, Validators.required),
      deleted: new FormControl(false, Validators.required),
    });

    this.rowsPerPage.valueChanges.subscribe();
    this.paginationFormGroup.valueChanges
      .subscribe(_ => {
        const request = {
          page: this.pageNumber.value,
          rowCount: 10,
          rowsPerPage: this.rowsPerPage.value
        } as PaginationResponse;
        this.getProjectList(request);
      });

    this.companyId.valueChanges
      .subscribe(v => {
        if (v && v instanceof Object && v.id) {
          const userCompanyId = this.companyLists.filter(r => r.id === v.id)[0].id;
          this.getCompanyUser(userCompanyId);
        }
      });

    this.searchProjects.valueChanges
      .subscribe(v => {
        this.searchProjectList = of(
          this.projectList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterProjectList.subscribe();
        if (v && v instanceof Object && v.id) {
          const filterProduct = this.projectList.map(
            item => {
              const cate = new ApiProjectDefinitionResponse(item);
              const cateId = this.companyLists.filter(r => r.id === cate.companyId);
              const givenId = this.usersList.filter(r => r.objectSid === cate.givenManager);
              const received = this.usersList.filter(r => r.objectSid === cate.receivedManager);
              cate.companyName = cateId.length > 0 ? cateId[0].name : 'Bilinmeyen Şirket';
              cate.givenManagerName = givenId.length > 0 ? givenId[0].displayName : 'Bilinmeyen Kullanıcı';
              cate.receivedManagerName = received.length > 0 ? received[0].displayName : 'Bilinmeyen Kullanıcı';
              return cate;
            }).filter(r => r.id === v.id);
          this.filterProjectList = of(filterProduct);
        }
        if (v === null || v === '') {
          this.filterProjectList = this.projectListRes;
          this.filterProjectList.subscribe();
        }
      });
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
  }

  public onPageChange(evt): void {
    this.pageNumber.setValue(evt);
  }

  public getCompanyUser(companyuserId: string): void {
    this.backendService.getCompanyUser(companyuserId)
      .subscribe(res => {
        if (res.error.code === 0) {
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
          this.searchProjectList = of(
            res.data.map(item => new ApiProjectDefinitionResponse(item)));
          this.filterProjectList2 = this.searchProjectList;
          if (this.setProjectID !== undefined) {
            const sProject = this.projectList.filter(v => v.id === this.setProjectID)[0];
            this.searchProjects.setValue(sProject);
          }
          else {
            const sProject = this.projectList.filter(v => v.name === this.name.value)[0];
            this.searchProjects.setValue(sProject);
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

  public getProjectList(request: PaginationResponse): void {
    this.backendService.getCompanies()
      .subscribe(r => {
        if (r.error.code === 0) {
          this.companyLists = r.data;
          this.filterCompanyLists = of(r.data);
          this.filterCompanyListsUserModal = of(r.data);
          this.backendService.getUsers()
            .subscribe(user => {
              if (user.error.code === 0) {
                this.filterUsersList = of(user.data);
                this.filterUsersList2 = of(user.data);
                this.usersList = user.data;
                this.backendService.getProjectList(request)
                  .subscribe(res => {
                    if (res.error.code === 0) {
                      this.filterProjectList = of(
                        res.data.map(
                          item => {
                            const cate = new ApiProjectDefinitionResponse(item);
                            const cateId = this.companyLists.filter(v => v.id === cate.companyId);
                            const givenId = this.usersList.filter(v => v.objectSid === cate.givenManager);
                            const received = this.usersList.filter(v => v.objectSid === cate.receivedManager);
                            cate.companyName = cateId.length > 0 ? cateId[0].name : 'Bilinmeyen Şirket';
                            cate.givenManagerName = givenId.length > 0 ? givenId[0].displayName : 'Bilinmeyen Kullanıcı';
                            cate.receivedManagerName = received.length > 0 ? received[0].displayName : 'Bilinmeyen Kullanıcı';
                            return cate;
                          }));
                      this.projectListRes = this.filterProjectList;
                      if (this.setProjectID !== undefined) {
                        const sProject = this.projectList.filter(v => v.id === this.setProjectID)[0];
                        this.searchProjects.setValue(sProject);
                      }
                      else {
                        const sProject = this.projectList.filter(v => v.name === this.name.value)[0];
                        this.searchProjects.setValue(sProject);
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
                  title: user.error.message,
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

  public openProjectModal(projectModal, status: number, p: ApiProjectDefinitionResponse): void {

    this.givenManager.valueChanges
      .subscribe(v => {
        this.filterUsersList = of(
          this.usersList.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.filterUsersList.subscribe();
      });

    this.receivedManager.valueChanges
      .subscribe(v => {
        this.filterUsersList2 = of(
          this.usersList.filter(r =>
            r.displayName.toLocaleLowerCase().includes((v && v.displayName || v || '').toLocaleLowerCase())));
        this.filterUsersList2.subscribe();
      });

    this.companyId.valueChanges
      .subscribe(v => {
        this.filterCompanyLists = of(
          this.companyLists.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterUsersList.subscribe();
      });

    if (status === 1) {
      this.modalHeader = 'Proje Ekleme';
      this.name.setValue(null);
      this.givenManager.setValue(null);
      this.receivedManager.setValue(null);
      this.companyId.setValue(null);
    }
    if (status === 2) {
      this.modalHeader = 'Proje Düzenleme';
      this.name.setValue(p.name);
      const given = this.usersList.filter(v => v.objectSid === p.givenManager)[0];
      this.givenManager.setValue(given);
      const make = this.usersList.filter(v => v.objectSid === p.receivedManager)[0];
      this.receivedManager.setValue(make);
      const comp = this.companyLists.filter(v => v.id === p.companyId)[0];
      this.companyId.setValue(comp);
      this.selectedProject = p;
    }
    this.modalService.open(projectModal, { centered: true });
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
      this.company.setValue(null);
      this.department.setValue(null);
      this.about.setValue(null);
    }

    this.modalService.open(userModal, { centered: true });
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
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getProjectList(request);
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
    data.companyId = this.companyId.value.id;
    if (this.selectedProject !== undefined) {
      this.setProjectID = this.selectedProject.id;
      data.id = this.selectedProject.id;
    }
    this.spinner.show();
    this.backendService.saveProject(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getProjectList(request);
          this.getProjects();
          this.modalService.dismissAll();
          this.saveProjectEnabled = false;
          this.spinner.hide();
          this.selectedProject = undefined;
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
          this.getProjectList(request);
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

  public deleteProject(p: ApiProjectDefinitionResponse): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Silinen Proje Geri Alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.value) {
        this.projectFormGroup.markAllAsTouched();
        this.name.setValue(p.name);
        const given = this.usersList.filter(v => v.objectSid === p.givenManager)[0];
        this.givenManager.setValue(given);
        const make = this.usersList.filter(v => v.objectSid === p.receivedManager)[0];
        this.receivedManager.setValue(make);
        const comp = this.companyLists.filter(v => v.id === p.companyId)[0];
        this.companyId.setValue(comp);
        if (!this.projectFormGroup.valid) {
          Swal.fire({
            title: 'Lütfen Gerekli Alanları Doldurunuz...',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#3fc3ee',
            icon: 'info'
          });
          return;
        }
        const data = this.projectFormGroup.getRawValue();
        data.deleted = true;
        data.id = p.id;
        data.givenManager = p.givenManager;
        data.receivedManager = p.receivedManager;
        data.companyId = p.companyId;
        this.spinner.show();
        this.backendService.saveProject(data)
          .subscribe(res => {
            if (res.error.code === 0) {
              const request = {
                page: this.pageNumber.value,
                rowCount: 10,
                rowsPerPage: this.rowsPerPage.value
              } as PaginationResponse;
              this.getProjectList(request);
              this.getProjects();
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

  public selectProperty(propertyName: string): (o: any) => string | undefined {
    return (o: any) => (o || {})[propertyName];
  }

  public toggleFieldTextType(): void {
    this.fieldTextType = !this.fieldTextType;
  }

}
