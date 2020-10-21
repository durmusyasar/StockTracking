import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

import { BackendService } from 'src/app/services/backend.service';
import { ApiCategoryDefinitionRequest } from 'src/app/services/serviceClasses/ApiCategoryDefinitionRequest';
import { ApiCategoryDefinitionResponse } from 'src/app/services/serviceClasses/ApiCategoryDefinitionResponse';
import { ApiSubCategoryDefinitionResponse } from 'src/app/services/serviceClasses/ApiSubCategoryDefinitionResponse';
import { ApiSubCategoryDefinitionRequest } from 'src/app/services/serviceClasses/ApiSubCategoryDefinitionRequest';
import { PaginationResponse } from 'src/app/services/serviceClasses/PaginationResponse';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})

export class CategoriesComponent implements OnInit {
  Math = Math;
  modalHeader: string;
  saveCategoryEnabled = false;
  saveSubCategoryEnabled = false;
  setCategoryID: string;

  selectedCategory: ApiCategoryDefinitionRequest;
  selectedSubCategory: ApiSubCategoryDefinitionRequest;
  filterCategoryList: Observable<ApiCategoryDefinitionResponse[]> = of([]);
  filterCategoryListModal: Observable<ApiCategoryDefinitionResponse[]> = of([]);
  categoryList: ApiCategoryDefinitionResponse[] = [];
  filterSubCategoryList: Observable<ApiSubCategoryDefinitionResponse[]> = of([]);
  subCategoryList: ApiSubCategoryDefinitionResponse[] = [];

  categoryFormGroup: FormGroup;
  subCategoryFormGroup: FormGroup;
  searchCategory: FormControl = new FormControl();
  paginationFormGroup: FormGroup;
  responsePagination: Observable<any> = of({});
  page = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public backendService: BackendService,
    private spinner: NgxSpinnerService
  ) { }

  public get name(): FormControl { return this.categoryFormGroup.get('name') as FormControl; }
  public get categoryDeleted(): FormControl { return this.categoryFormGroup.get('categoryDeleted') as FormControl; }

  public get parentId(): FormControl { return this.subCategoryFormGroup.get('parentId') as FormControl; }
  public get subCategory(): FormControl { return this.subCategoryFormGroup.get('subCategory') as FormControl; }
  public get subCategoryDeleted(): FormControl { return this.subCategoryFormGroup.get('deleted') as FormControl; }

  public get pageNumber(): FormControl { return this.paginationFormGroup.get('page') as FormControl; }
  public get rowsPerPage(): FormControl { return this.paginationFormGroup.get('rowsPerPage') as FormControl; }

  public ngOnInit(): void {
    this.initCategoryForm();
    this.initSubCategoryForm();
    this.getCategory();
    const request = {
      page: this.pageNumber.value,
      rowCount: 10,
      rowsPerPage: this.rowsPerPage.value
    } as PaginationResponse;
    this.getSubCategory(request);
  }

  public initCategoryForm(): void {
    this.categoryFormGroup = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      type: new FormControl(0, Validators.required),
      deleted: new FormControl(false, Validators.required)
    });

    this.searchCategory.valueChanges
      .subscribe(v => {
        this.filterCategoryList = of(
          this.categoryList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCategoryList.subscribe();
        if (v && v instanceof Object && v.id) {
          const filterCategoryId = this.subCategoryList.filter(r => r.parentId === v.id);
          this.filterSubCategoryList = of(filterCategoryId);
          this.filterSubCategoryList.subscribe();
        }
        if (v === null || v === '') {
          this.filterSubCategoryList = of(this.subCategoryList);
        }
      });
  }

  public initSubCategoryForm(): void {
    this.paginationFormGroup = this.formBuilder.group({
      page: new FormControl(1),
      rowsPerPage: new FormControl(10)
    });

    this.subCategoryFormGroup = this.formBuilder.group({
      parentId: new FormControl(null, Validators.required),
      subCategory: new FormControl(null, Validators.required),
      type: new FormControl(1, Validators.required),
      deleted: new FormControl(false, Validators.required)
    });

    this.rowsPerPage.valueChanges.subscribe();
    this.paginationFormGroup.valueChanges
    .subscribe(_ => {
      const request = {
        page: this.pageNumber.value,
        rowCount: 10,
        rowsPerPage: this.rowsPerPage.value
      } as PaginationResponse;
      this.getSubCategory(request);
    });

    this.parentId.valueChanges
      .subscribe(v => {
        this.filterCategoryList = of(
          this.categoryList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterCategoryList.subscribe();
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
          this.filterCategoryListModal = this.filterCategoryList;
          if (this.setCategoryID !== undefined) {
            const sCategory = this.categoryList.filter(v => v.id === this.setCategoryID)[0];
            this.searchCategory.setValue(sCategory);
          } else {
            const sCategory = this.categoryList.filter(v => v.name === this.name.value)[0];
            this.searchCategory.setValue(sCategory);
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

  public getSubCategory(request: PaginationResponse): void {
    this.backendService.getCategoryList(request)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.subCategoryList = res.data;
          this.filterSubCategoryList = of(
            res.data.map(
              item => new ApiSubCategoryDefinitionResponse(item))
              .sort((item1, item2) => item1.childName.localeCompare(item2.childName)));
          const sCategory = this.categoryList.filter(v => v.id === this.setCategoryID)[0];
          this.searchCategory.setValue(sCategory);
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

  public openCategoryModal(category, status: number): void {
    if (status === 1) {
      this.modalHeader = 'Kategori Ekleme';
      this.name.setValue(this.searchCategory.value);
      this.selectedCategory = undefined;
    }
    if (status === 2) {
      this.modalHeader = 'Kategori Düzenleme';
      this.selectedCategory = this.searchCategory.value;
      this.name.setValue(this.selectedCategory.name);
    }
    this.modalService.open(category, { centered: true });
  }

  public openSubCategoryModal(subCategoryModal, status: number, sc: ApiSubCategoryDefinitionResponse): void {
    if (status === 1) {
      this.modalHeader = 'Alt Kategori Ekleme';
      this.parentId.setValue(this.searchCategory.value);
      this.parentId.disable({ emitEvent: false });
      this.subCategory.setValue(null);
      this.selectedSubCategory = undefined;
    }
    if (status === 2) {
      this.modalHeader = 'Alt Kategori Düzenleme';
      this.selectedSubCategory = sc;
      const categoryvalue = this.categoryList.filter(v => v.id === sc.parentId)[0];
      this.parentId.setValue(categoryvalue);
      this.parentId.enable({ emitEvent: false });
      this.subCategory.setValue(sc.childName);
    }
    this.modalService.open(subCategoryModal, { centered: true });
  }

  public saveCategory(): void {
    this.categoryFormGroup.markAllAsTouched();
    if (!this.categoryFormGroup.valid) {
      Swal.fire({
        title: 'Lütfen Gerekli Alanları Doldurunuz...',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#3fc3ee',
        icon: 'info'
      });
      return;
    }
    this.saveCategoryEnabled = true;
    const data = this.categoryFormGroup.getRawValue();
    if (this.selectedCategory !== undefined) {
      this.setCategoryID = this.selectedCategory.id;
      data.id = this.selectedCategory.id;
      data.parentId = this.selectedCategory.parentId;
    }
    this.spinner.show();
    this.backendService.saveCategory(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.modalService.dismissAll();
          this.getCategory();
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getSubCategory(request);
          this.saveCategoryEnabled = false;
          this.spinner.hide();
          this.selectedCategory = undefined;
          Swal.fire({
            title: 'Kayıt Başarılı',
            position: 'center',
            timer: 1200,
            icon: 'success',
            showConfirmButton: false
          });
        } else {
          this.saveCategoryEnabled = false;
          this.spinner.hide();
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        this.saveCategoryEnabled = false;
        this.spinner.hide();
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }

  public deleteCategory(): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Silinen Kategori Geri Alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.value) {
        this.categoryFormGroup.markAllAsTouched();
        this.name.setValue(this.searchCategory.value.name);
        if (!this.categoryFormGroup.valid) {
          Swal.fire({
            title: 'Lütfen Gerekli Alanları Doldurunuz...',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#3fc3ee',
            icon: 'info'
          });
          return;
        }
        const data = this.categoryFormGroup.getRawValue();
        data.deleted = true;
        data.id = this.searchCategory.value.id;
        data.parentId = this.searchCategory.value.parentId;
        this.spinner.show();
        this.backendService.saveCategory(data)
          .subscribe(res => {
            if (res.error.code === 0) {
              this.getCategory();
              this.searchCategory.setValue(null);
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
    if (this.selectedSubCategory !== undefined) {
      data.id = this.selectedSubCategory.childId;
    }
    data.parentId = this.parentId.value.id;
    data.name = this.subCategory.value;
    this.setCategoryID = this.parentId.value.id;
    this.spinner.show();
    this.backendService.saveCategory(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getSubCategory(request);
          this.modalService.dismissAll();
          this.spinner.hide();
          this.selectedSubCategory = undefined;
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

  public deleteSubCategory(sc: ApiSubCategoryDefinitionResponse): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Silinen Alt Kategori Geri Alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.value) {
        this.subCategoryFormGroup.markAllAsTouched();
        this.name.setValue(sc.childName);
        this.parentId.setValue(sc.parentId);
        this.subCategory.setValue(sc.childName);
        if (!this.subCategoryFormGroup.valid) {
          Swal.fire({
            title: 'Lütfen Gerekli Alanları Doldurunuz...',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#3fc3ee',
            icon: 'info'
          });
          return;
        }
        const data = this.subCategoryFormGroup.getRawValue();
        data.name = sc.childName;
        data.deleted = true;
        data.id = sc.childId;
        data.parentId = sc.parentId;
        this.spinner.show();
        this.backendService.saveCategory(data)
          .subscribe(res => {
            if (res.error.code === 0) {
              const request = {
                page: this.pageNumber.value,
                rowCount: 10,
                rowsPerPage: this.rowsPerPage.value
              } as PaginationResponse;
              this.getSubCategory(request);
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

  public onPageChange(evt): void {
    this.pageNumber.setValue(evt);
  }

  public selectProperty(propertyName: string): (o: any) => string | undefined {
    return (o: any) => (o || {})[propertyName];
  }
}
