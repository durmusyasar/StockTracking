import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

import { BackendService } from 'src/app/services/backend.service';
import { Observable, of } from 'rxjs';
import { ApiStockDefinitionResponse } from 'src/app/services/serviceClasses/ApiStockDefinitionResponse';
import { ApiCompanyDefinitionResponse } from 'src/app/services/serviceClasses/ApiCompanyDefinitionResponse';
import { ApiProjectDefinitionResponse } from 'src/app/services/serviceClasses/ApiProjectDefinitionResponse';
import { ApiStockConfirmResponse } from 'src/app/services/serviceClasses/ApiStockConfirmResponse';
import { ApiProductDefinitionResponse } from 'src/app/services/serviceClasses/ApiProductDefinitionResponse';
import { ApiProfileDefinitionResponse } from 'src/app/services/serviceClasses/ApiProfileDefinitionResponse';
import { PaginationResponse } from 'src/app/services/serviceClasses/PaginationResponse';

@Component({
  selector: 'app-stock-confirm',
  templateUrl: './stock-confirm.component.html',
  styleUrls: ['./stock-confirm.component.css']
})
export class StockConfirmComponent implements OnInit {
  Math = Math;
  modalHeader: string;
  error = false;
  invoiceNo: string;
  receiverId: ApiProfileDefinitionResponse;
  deliveryPersonId: ApiProfileDefinitionResponse;

  filterStockList: Observable<ApiStockDefinitionResponse[]> = of([]);
  searchStockList: Observable<ApiStockDefinitionResponse[]> = of([]);
  stockList: ApiStockDefinitionResponse[];
  companyLists: ApiCompanyDefinitionResponse[];
  projectLists: ApiProjectDefinitionResponse[];
  stockProductList: Observable<ApiStockConfirmResponse[]> = of([]);
  productLists: ApiProductDefinitionResponse[];
  userList: ApiProfileDefinitionResponse[];

  stockConfirmFormGroup: FormGroup;
  searchStocks: FormControl = new FormControl();
  paginationFormGroup: FormGroup;
  responsePagination: Observable<any> = of({});
  page = 0;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public backendService: BackendService,
    private spinner: NgxSpinnerService
  ) { }

  public get stockId(): FormControl { return this.stockConfirmFormGroup.get('stockId') as FormControl; }
  public get confirmStatus(): FormControl { return this.stockConfirmFormGroup.get('confirmStatus') as FormControl; }
  public get note(): FormControl { return this.stockConfirmFormGroup.get('note') as FormControl; }

  public get pageNumber(): FormControl { return this.paginationFormGroup.get('page') as FormControl; }
  public get rowsPerPage(): FormControl { return this.paginationFormGroup.get('rowsPerPage') as FormControl; }


  public ngOnInit(): void {
    this.initStockConfirmForm();
    this.getUsers();

    const request = {
      page: this.pageNumber.value,
      rowCount: 10,
      rowsPerPage: this.rowsPerPage.value
    } as PaginationResponse;
    this.getStocks(request);
  }

  public initStockConfirmForm(): void {
    this.paginationFormGroup = this.formBuilder.group({
      page: new FormControl(1),
      rowsPerPage: new FormControl(10)
    });

    this.stockConfirmFormGroup = this.formBuilder.group({
      stockId: new FormControl(null, Validators.required),
      confirmStatus: new FormControl(null, Validators.required),
      note: new FormControl(null)
    });

    this.rowsPerPage.valueChanges.subscribe();
    this.paginationFormGroup.valueChanges
      .subscribe(_ => {
        const request = {
          page: this.pageNumber.value,
          rowCount: 10,
          rowsPerPage: this.rowsPerPage.value
        } as PaginationResponse;
        this.getStocks(request);
      });

    this.searchStocks.valueChanges
      .subscribe(v => {
        this.searchStockList = of(
          this.stockList.filter(r =>
            r.invoiceNo.toLocaleLowerCase().includes((v && v.invoiceNo || v || '').toLocaleLowerCase())));
        if (v !== null && v.id) {
          const filterProduct = this.stockList.map(
            item => {
              const stock = new ApiStockDefinitionResponse(item);
              const comp1 = this.companyLists.filter(r => r.id === stock.incomingCompanyId);
              const comp2 = this.companyLists.filter(r => r.id === stock.outgoingCompanyId);
              const proj = this.projectLists.filter(r => r.id === stock.projectId);
              stock.incomingCompanyName = comp1.length > 0 ? comp1[0].name : 'Bilinmeyen Şirket';
              stock.outgoingCompanyName = comp2.length > 0 ? comp2[0].name : 'Bilinmeyen Şirket';
              stock.projectName = proj.length > 0 ? proj[0].name : 'Bilinmeyen Proje';
              return stock;
            }).filter(r => r.id === v.id);
          this.filterStockList = of(filterProduct);
        } else if (v === null) {
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getStocks(request);
        }
      });
  }

  public onPageChange(evt): void {
    this.pageNumber.setValue(evt);
  }

  public getStocks(request: any): void {
    this.backendService.getCompanies()
      .subscribe(com => {
        if (com.error.code === 0) {
          this.companyLists = com.data;
          this.backendService.getProjects()
            .subscribe(pro => {
              if (pro.error.code === 0) {
                this.projectLists = pro.data;
                const userId = this.backendService.currentUser().objectSid;
                this.backendService.getStockList(userId, request)
                  .subscribe(res => {
                    if (res.error.code === 0) {
                      this.stockList = res.data;
                      this.filterStockList = of(
                        res.data.map(
                          item => {
                            const stock = new ApiStockDefinitionResponse(item);
                            const comp1 = this.companyLists.filter(r => r.id === stock.incomingCompanyId);
                            const comp2 = this.companyLists.filter(r => r.id === stock.outgoingCompanyId);
                            const proj = this.projectLists.filter(r => r.id === stock.projectId);
                            stock.incomingCompanyName = comp1.length > 0 ? comp1[0].name : 'Bilinmeyen Şirket';
                            stock.outgoingCompanyName = comp2.length > 0 ? comp2[0].name : 'Bilinmeyen Şirket';
                            stock.projectName = proj.length > 0 ? proj[0].name : 'Bilinmeyen Proje';
                            return stock;
                          }));
                      this.searchStockList = this.filterStockList;
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
            });
        }
      });
  }

  public getStockProduct(stockId: string): void {
    this.backendService.getProducts()
      .subscribe(prod => {
        if (prod.error.code === 0) {
          this.productLists = prod.data;
          this.backendService.getStockProduct(stockId)
            .subscribe(res => {
              if (res.error.code === 0) {
                this.stockProductList = of(
                  res.data.map(item => {
                    const product = new ApiStockConfirmResponse(item);
                    const name = this.productLists.filter(v => v.id === product.id);
                    product.productName = name.length > 0 ? name[0].name : 'Bilinmeyen Ürün';
                    return product;
                  })
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
      });
  }

  public getUsers(): void {
    this.backendService.getUsers()
      .subscribe(res => {
        if (res.error.code === 0) {
          this.userList = res.data;
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

  openStockModal(stock, item: ApiStockDefinitionResponse): void {
    this.modalHeader = 'Stok Detay';
    this.invoiceNo = this.stockList.filter(r => r.invoiceNo === item.invoiceNo)[0].invoiceNo;
    const receiverUser = this.stockList.filter(r => r.receiver === item.receiver)[0].receiver;
    this.receiverId = this.userList.filter(r => r.objectSid === receiverUser)[0];
    const deliveryUser = this.stockList.filter(r => r.deliveryPerson === item.deliveryPerson)[0].deliveryPerson;
    this.deliveryPersonId = this.userList.filter(r => r.objectSid === deliveryUser)[0];
    this.stockId.setValue(item.id);
    this.getStockProduct(item.id);
    this.modalService.open(stock, { centered: true });
  }

  saveStockConfirm(confirmStatus: number): void {
    this.confirmStatus.setValue(confirmStatus);
    if (!this.stockConfirmFormGroup.valid) {
      return;
    }
    const data = this.stockConfirmFormGroup.getRawValue();
    this.spinner.show();
    this.backendService.confirmStock(data)
      .subscribe(res => {
        if (res.error.code === 0) {
          this.modalService.dismissAll();
          this.initStockConfirmForm();
          const request = {
            page: this.pageNumber.value,
            rowCount: 10,
            rowsPerPage: this.rowsPerPage.value
          } as PaginationResponse;
          this.getStocks(request);
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

  public selectProperty(propertyName: string): (o: any) => string | undefined {
    return (o: any) => (o || {})[propertyName];
  }
}
