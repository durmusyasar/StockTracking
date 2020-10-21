import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

import { BackendService } from 'src/app/services/backend.service';
import { ApiCompanyDefinitionResponse } from 'src/app/services/serviceClasses/ApiCompanyDefinitionResponse';
import { ApiCompanyDefinitionRequest } from 'src/app/services/serviceClasses/ApiCompanyDefinitionRequest';
import { ApiCompanyUserResponse } from 'src/app/services/serviceClasses/ApiCompanyUserResponse';
import { PaginationResponse } from 'src/app/services/serviceClasses/PaginationResponse';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})

export class CompaniesComponent implements OnInit {
  Math = Math;
  modalHeader: string;
  clearButton = true;
  saveCompanyEnabled = false;
  setCompanyID: string;

  selectedCompany: ApiCompanyDefinitionRequest;
  filterCompanyList: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  filterCompanyList2: Observable<ApiCompanyDefinitionResponse[]> = of([]);
  companyList: ApiCompanyDefinitionResponse[] = [];
  companyUserList: Observable<ApiCompanyUserResponse[]> = of([]);

  companiesFormGroup: FormGroup;
  searchCompany: FormControl = new FormControl();
  paginationFormGroup: FormGroup;
  responsePagination: Observable<any> = of({});
  page = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public backendService: BackendService,
    private spinner: NgxSpinnerService
  ) { }

  public get name(): FormControl { return this.companiesFormGroup.get('name') as FormControl; }
  public get taxNo(): FormControl { return this.companiesFormGroup.get('taxNo') as FormControl; }
  public get address(): FormControl { return this.companiesFormGroup.get('address') as FormControl; }
  public get eposta(): FormControl { return this.companiesFormGroup.get('eposta') as FormControl; }
  public get phone(): FormControl { return this.companiesFormGroup.get('phone') as FormControl; }
  public get webSite(): FormControl { return this.companiesFormGroup.get('webSite') as FormControl; }
  public get deleted(): FormControl { return this.companiesFormGroup.get('deleted') as FormControl; }
  public get isShipping(): FormControl { return this.companiesFormGroup.get('isShipping') as FormControl; }

  public get pageNumber(): FormControl { return this.paginationFormGroup.get('page') as FormControl; }
  public get rowsPerPage(): FormControl { return this.paginationFormGroup.get('rowsPerPage') as FormControl; }

  public ngOnInit(): void {
    this.initCompaniesForm();
    this.getCompany();
    const request = {
      page: this.pageNumber.value,
      rowCount: 10,
      rowsPerPage: this.rowsPerPage.value
    } as PaginationResponse;
    this.getCompanyList(request);
  }

  public initCompaniesForm(): void {
    this.paginationFormGroup = this.formBuilder.group({
      page: new FormControl(1),
      rowsPerPage: new FormControl(10)
    });

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

    this.rowsPerPage.valueChanges.subscribe();
    this.paginationFormGroup.valueChanges
      .subscribe(_ => {
        const request = {
          page: this.pageNumber.value,
          rowCount: 10,
          rowsPerPage: this.rowsPerPage.value
        } as PaginationResponse;
        this.getCompanyList(request);
      });

    this.searchCompany.valueChanges
      .subscribe(v => {
        this.filterCompanyList2 = of(
          this.companyList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCompanyList2.subscribe();
        if (v && v instanceof Object && v.id) {
          const filterComnpany = this.companyList.filter(r => r.id === v.id);
          this.filterCompanyList = of(filterComnpany);
        }
        if (v === null || v === '') {
          this.filterCompanyList = of(this.companyList);
          this.filterCompanyList.subscribe();
        }
      });
  }

  public onPageChange(evt): void {
    this.pageNumber.setValue(evt);
  }

  public getCompany(): void {
    this.backendService.getCompanies()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.companyList = res.data;
          this.filterCompanyList2 = of(
            res.data.map(
              item => new ApiCompanyDefinitionResponse(item))
              .sort((item1, item2) => item1.name.localeCompare(item2.name)));
          if (this.setCompanyID !== undefined) {
            const sCompany = this.companyList.filter(v => v.id === this.setCompanyID)[0];
            this.searchCompany.setValue(sCompany);
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

  public getCompanyList(request: PaginationResponse): void {
    this.backendService.getCompanyList(request)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.filterCompanyList = of(
            res.data.map(
              item => new ApiCompanyDefinitionResponse(item))
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

  public getCompanyUser(companyId: string): void {
    this.backendService.getCompanyUser(companyId)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.companyUserList = of(
            res.data.map(item => {
              const comUser = new ApiCompanyUserResponse(item);
              if (comUser.thumbnailPhoto !== null) {
                // tslint:disable-next-line:no-construct
                const photo = new String('data:image/jpeg;base64,');
                comUser.thumbnailPhoto = photo.concat(item.thumbnailPhoto);
              }
              if (comUser.thumbnailPhoto === null && comUser.userPhoto === null) {
                comUser.thumbnailPhoto = '../../../assets/images/users/default.jpg';
              }
              else if (comUser.userPhoto !== null) {
                comUser.thumbnailPhoto = comUser.userPhoto;
              }
              return comUser;
            }));
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

  public openCompanyModal(companyModal, status: number, c: ApiCompanyDefinitionResponse): void {
    this.name.enable({ emitEvent: false });
    this.taxNo.enable({ emitEvent: false });
    this.address.enable({ emitEvent: false });
    this.eposta.enable({ emitEvent: false });
    this.phone.enable({ emitEvent: false });
    this.webSite.enable({ emitEvent: false });
    this.clearButton = true;

    if (status === 1) {
      this.modalHeader = 'Firma Ekleme';
      this.isShipping.setValue(false);
      this.name.setValue(null);
      this.taxNo.setValue(null);
      this.address.setValue(null);
      this.eposta.setValue(null);
      this.phone.setValue(null);
      this.webSite.setValue(null);
      this.selectedCompany = undefined;
    }

    if (status === 2) {
      this.modalHeader = 'Firma Düzenleme';
      this.name.setValue(c.name);
      this.taxNo.setValue(c.taxNo);
      this.address.setValue(c.address);
      this.eposta.setValue(c.eposta);
      this.phone.setValue(c.phone);
      this.webSite.setValue(c.webSite);
      this.isShipping.setValue(c.isShipping);
      this.selectedCompany = c;
    }

    if (status === 3) {
      this.getCompanyUser(c.id);
      this.clearButton = false;
      this.modalHeader = 'Firma Detay';
      this.isShipping.setValue(c.isShipping);
      this.isShipping.disable({ emitEvent: false });
      this.name.setValue(c.name);
      this.name.disable({ emitEvent: false });
      this.taxNo.setValue(c.taxNo);
      this.taxNo.disable({ emitEvent: false });
      this.address.setValue(c.address);
      this.address.disable({ emitEvent: false });
      this.eposta.setValue(c.eposta);
      this.eposta.disable({ emitEvent: false });
      this.phone.setValue(c.phone);
      this.phone.disable({ emitEvent: false });
      this.webSite.setValue(c.webSite);
      this.webSite.disable({ emitEvent: false });
      this.selectedCompany = c;
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
    if (this.selectedCompany !== undefined) {
      data.id = this.selectedCompany.id;
      this.setCompanyID = this.selectedCompany.id;
    }
    this.spinner.show();
    this.backendService.saveCompany(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getCompanyList(request);
          this.getCompany();
          this.modalService.dismissAll();
          this.saveCompanyEnabled = false;
          this.spinner.hide();
          this.selectedCompany = undefined;
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

  public deleteCompany(c: ApiCompanyDefinitionResponse): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Silinen Şirket Geri Alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.value) {
        this.companiesFormGroup.markAllAsTouched();
        this.name.setValue(c.name);
        this.taxNo.setValue(c.taxNo);
        this.address.setValue(c.address);
        this.phone.setValue(c.phone);
        this.eposta.setValue(c.eposta);
        this.webSite.setValue(c.webSite);
        if (!this.companiesFormGroup.valid) {
          Swal.fire({
            title: 'Lütfen Gerekli Alanları Doldurunuz...',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#3fc3ee',
            icon: 'info'
          });
          return;
        }
        this.spinner.show();
        const data = this.companiesFormGroup.getRawValue();
        data.deleted = true;
        data.id = c.id;
        this.backendService.saveCompany(data)
          .subscribe(res => {
            if (res.error.code === 0) {
              const request = {
                page: this.pageNumber.value,
                rowCount: 10,
                rowsPerPage: this.rowsPerPage.value
              } as PaginationResponse;
              this.getCompanyList(request);
              this.getCompany();
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
}
