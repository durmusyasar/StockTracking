import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

import { BackendService } from 'src/app/services/backend.service';
import { ApiSubCategoryDefinitionResponse } from 'src/app/services/serviceClasses/ApiSubCategoryDefinitionResponse';
import { ApiCategoryDefinitionResponse } from 'src/app/services/serviceClasses/ApiCategoryDefinitionResponse';
import { ApiProductDefinitionResponse } from 'src/app/services/serviceClasses/ApiProductDefinitionResponse';
import { PaginationResponse } from 'src/app/services/serviceClasses/PaginationResponse';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  Math = Math;
  modalHeader: string;
  categoryId: string;
  setProductID: string;
  saveProductEnabled = false;
  saveSubCategoryEnabled = false;
  selectedProduct: ApiProductDefinitionResponse;

  searchProductList: Observable<ApiProductDefinitionResponse[]> = of([]);
  filterProductList: Observable<ApiProductDefinitionResponse[]> = of([]);
  filterProductList2: Observable<ApiProductDefinitionResponse[]> = of([]);
  productList: ApiProductDefinitionResponse[] = [];

  categoryList2: ApiSubCategoryDefinitionResponse[];
  categoryList: ApiCategoryDefinitionResponse[] = [];
  subCategoryList: ApiCategoryDefinitionResponse[];
  filterSubCategoryList: Observable<ApiCategoryDefinitionResponse[]> = of([]);
  filterCategoryList: Observable<ApiCategoryDefinitionResponse[]> = of([]);

  subCategoryFormGroup: FormGroup;
  productFormGroup: FormGroup;
  searchProducts: FormControl = new FormControl();
  paginationFormGroup: FormGroup;
  responsePagination: Observable<any> = of({});
  page = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public backendService: BackendService,
    private spinner: NgxSpinnerService
  ) { }

  public get category(): FormControl { return this.productFormGroup.get('category') as FormControl; }
  public get name(): FormControl { return this.productFormGroup.get('name') as FormControl; }
  public get genus(): FormControl { return this.productFormGroup.get('genus') as FormControl; }
  public get criticalLevel(): FormControl { return this.productFormGroup.get('criticalLevel') as FormControl; }
  public get deleted(): FormControl { return this.productFormGroup.get('deleted') as FormControl; }
  public get inStock(): FormControl { return this.productFormGroup.get('inStock') as FormControl; }

  public get parentId(): FormControl { return this.subCategoryFormGroup.get('parentId') as FormControl; }
  public get subCategory(): FormControl { return this.subCategoryFormGroup.get('subCategory') as FormControl; }
  public get subCategoryDeleted(): FormControl { return this.subCategoryFormGroup.get('deleted') as FormControl; }

  public get pageNumber(): FormControl { return this.paginationFormGroup.get('page') as FormControl; }
  public get rowsPerPage(): FormControl { return this.paginationFormGroup.get('rowsPerPage') as FormControl; }

  public ngOnInit(): void {
    this.initProductForm();
    this.getSubCategory();
    this.getCategory();
    this.getProduct();
    this.initSubCategoryForm();

    const request = {
      page: this.pageNumber.value,
      rowCount: 10,
      rowsPerPage: this.rowsPerPage.value
    } as PaginationResponse;
    this.getProductList(request);

    this.category.valueChanges
      .subscribe(v => {
        this.filterSubCategoryList = of(
          this.subCategoryList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
      });
  }

  public initProductForm(): void {
    this.paginationFormGroup = this.formBuilder.group({
      page: new FormControl(1),
      rowsPerPage: new FormControl(10)
    });

    this.productFormGroup = this.formBuilder.group({
      category: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      genus: new FormControl(null, Validators.required),
      criticalLevel: new FormControl(10, Validators.required),
      deleted: new FormControl(false, Validators.required),
      inStock: new FormControl(null, Validators.required)
    });

    this.rowsPerPage.valueChanges.subscribe();
    this.paginationFormGroup.valueChanges
      .subscribe(_ => {
        const request = {
          page: this.pageNumber.value,
          rowCount: 10,
          rowsPerPage: this.rowsPerPage.value
        } as PaginationResponse;
        this.getProductList(request);
      });

    this.searchProducts.valueChanges
      .subscribe(v => {
        this.searchProductList = of(
          this.productList.filter(r =>
            r.name.toLocaleLowerCase().includes((v && v.name || v || '').toLocaleLowerCase())));
        this.filterProductList.subscribe();
        if (v && v instanceof Object && v.id) {
          const filterProduct = this.productList.map(
            item => {
              const i = new ApiProductDefinitionResponse(item);
              const cat = this.categoryList2.filter(r => r.childId === i.categoryId);
              i.categoryName = cat.length > 0 ? cat[0].parentName : 'Bilinmeyen Kategori';
              i.subCategoryName = cat.length > 0 ? cat[0].childName : 'Bilinmeyen Alt Kategori';
              return i;
            }).filter(r => r.id === v.id);
          this.filterProductList = of(filterProduct);
        }
        if (v === null || v === '') {
          this.filterProductList = this.filterProductList2;
          this.filterProductList.subscribe();
        }
      });
  }

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

  public onPageChange(evt): void {
    this.pageNumber.setValue(evt);
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

  public getSubCategory(): void {
    this.backendService.getSubCategoryList()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.subCategoryList = res.data;
          this.filterSubCategoryList = of(res.data.map(item => new ApiCategoryDefinitionResponse(item)));
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

  public getProduct(): void {
    this.backendService.getProducts()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.productList = res.data;
          this.searchProductList = of(
            res.data.map(item => new ApiProductDefinitionResponse(item))
          );
          if (this.setProductID !== undefined) {
            const sProduct = this.productList.filter(v => v.id === this.setProductID)[0];
            this.searchProducts.setValue(sProduct);
          } else {
            const sProduct = this.productList.filter(v => v.name === this.name.value)[0];
            this.searchProducts.setValue(sProduct);
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

  public getProductList(request: PaginationResponse): void {
    this.backendService.getSubCategories()
      .subscribe(r => {
        if (r.error.code === 0) {
          this.categoryList2 = r.data;
          this.backendService.getProductList(request)
            .subscribe(res => {
              if (res.error.code === 0) {
                this.filterProductList = of(
                  res.data.map(
                    item => {
                      const i = new ApiProductDefinitionResponse(item);
                      const cat = this.categoryList2.filter(v => v.childId === i.categoryId);
                      i.categoryName = cat.length > 0 ? cat[0].parentName : 'Bilinmeyen Kategori';
                      i.subCategoryName = cat.length > 0 ? cat[0].childName : 'Bilinmeyen Alt Kategori';
                      return i;
                    })
                );
                this.filterProductList2 = this.filterProductList;
                if (this.setProductID !== undefined) {
                  const sProduct = this.productList.filter(v => v.id === this.setProductID)[0];
                  this.searchProducts.setValue(sProduct);
                } else {
                  const sProduct = this.productList.filter(v => v.name === this.name.value)[0];
                  this.searchProducts.setValue(sProduct);
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

  public openProductModal(productModal, status: number, p: ApiProductDefinitionResponse): void {
    if (status === 1) {
      this.modalHeader = 'Ürün Ekleme';
      this.category.setValue(null);
      this.name.setValue(null);
      this.genus.setValue(null);
      this.inStock.setValue(null);
      this.selectedProduct = undefined;
    }
    if (status === 2) {
      this.selectedProduct = p;
      this.modalHeader = 'Ürün Düzenleme';
      const selected = this.subCategoryList.filter(v => v.id === p.categoryId)[0];
      this.category.setValue(selected);
      this.name.setValue(p.name);
      this.genus.setValue(p.genus);
      this.criticalLevel.setValue(p.criticalLevel);
      this.inStock.setValue(p.inStock);
    }
    this.modalService.open(productModal, { centered: true });
  }

  public openSubCategoryModal(subCategoryModal, status: number): void {
    if (status === 1) {
      this.modalService.dismissAll();
      this.modalHeader = 'Alt Kategori Ekleme';
      this.subCategory.setValue(null);
      this.parentId.setValue(null);
    }

    this.modalService.open(subCategoryModal, { centered: true });
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
          this.getSubCategory();
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
    if (this.selectedProduct !== undefined) {
      data.id = this.selectedProduct.id;
      this.setProductID = this.selectedProduct.id;
    }
    this.spinner.show();
    this.backendService.saveProduct(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getProductList(request);
          this.getProduct();
          this.modalService.dismissAll();
          this.saveProductEnabled = false;
          this.selectedProduct = undefined;
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

  public deleteProduct(p: ApiProductDefinitionResponse): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Silinen Ürün Geri Alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.value) {
        this.productFormGroup.markAllAsTouched();
        this.category.setValue(p.categoryId);
        this.name.setValue(p.name);
        this.genus.setValue(p.genus);
        this.criticalLevel.setValue(p.criticalLevel);
        if (!this.productFormGroup.valid) {
          Swal.fire({
            title: 'Lütfen Gerekli Alanları Doldurunuz...',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#3fc3ee',
            icon: 'info'
          });
          return;
        }
        const data = this.productFormGroup.getRawValue();
        data.categoryId = this.category.value;
        data.deleted = true;
        data.id = p.id;
        this.spinner.show();
        this.backendService.saveProduct(data)
          .subscribe(res => {
            if (res.error.code === 0) {
              const request = {
                page: this.pageNumber.value,
                rowCount: 10,
                rowsPerPage: this.rowsPerPage.value
              } as PaginationResponse;
              this.getProductList(request);
              this.getProduct();
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
