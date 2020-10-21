import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import Swal from 'sweetalert2';

import { BackendService } from 'src/app/services/backend.service';
import { ApiStockDefinitionResponse } from 'src/app/services/serviceClasses/ApiStockDefinitionResponse';
import { ApiCompanyDefinitionResponse } from 'src/app/services/serviceClasses/ApiCompanyDefinitionResponse';
import { ApiProjectDefinitionResponse } from 'src/app/services/serviceClasses/ApiProjectDefinitionResponse';
import { ApiStockConfirmResponse } from 'src/app/services/serviceClasses/ApiStockConfirmResponse';
import { ApiProductDefinitionResponse } from 'src/app/services/serviceClasses/ApiProductDefinitionResponse';
import { ApiProfileDefinitionResponse } from 'src/app/services/serviceClasses/ApiProfileDefinitionResponse';
import { PaginationResponse } from 'src/app/services/serviceClasses/PaginationResponse';

@Component({
  selector: 'app-stock-history',
  templateUrl: './stock-history.component.html',
  styleUrls: ['./stock-history.component.css']
})
export class StockHistoryComponent implements OnInit {
  Math = Math;
  modalHeader: string;
  invoiceNo: string;
  receiverId: ApiProfileDefinitionResponse;
  deliveryPersonId: ApiProfileDefinitionResponse;
  note: string;

  filterStockList: Observable<ApiStockDefinitionResponse[]> = of([]);
  filterStockList2: Observable<ApiStockDefinitionResponse[]> = of([]);
  searchStockList: Observable<ApiStockDefinitionResponse[]> = of([]);
  stockList: ApiStockDefinitionResponse[] = [];
  companyLists: ApiCompanyDefinitionResponse[];
  projectLists: ApiProjectDefinitionResponse[];
  stockProductList: Observable<ApiStockConfirmResponse[]> = of([]);
  productLists: ApiProductDefinitionResponse[];
  userList: ApiProfileDefinitionResponse[];

  searchStocks: FormControl = new FormControl();
  paginationFormGroup: FormGroup;
  responsePagination: Observable<any> = of({});
  page = 0;

  constructor(
    private modalService: NgbModal,
    private backendService: BackendService,
    private formBuilder: FormBuilder
  ) { }

  public get pageNumber(): FormControl { return this.paginationFormGroup.get('page') as FormControl; }
  public get rowsPerPage(): FormControl { return this.paginationFormGroup.get('rowsPerPage') as FormControl; }


  public ngOnInit(): void {
    this.getUsers();

    this.paginationFormGroup = this.formBuilder.group({
      page: new FormControl(1),
      rowsPerPage: new FormControl(10)
    });

    const request = {
      page: this.pageNumber.value,
      rowCount: 10,
      rowsPerPage: this.rowsPerPage.value
    } as PaginationResponse;
    this.getStocks(request);

    this.searchStocks.valueChanges
      .subscribe(v => {
        this.searchStockList = of(
          this.stockList.filter(r =>
            r.invoiceNo.toLocaleLowerCase().includes((v && v.invoiceNo || v || '').toLocaleLowerCase())));
        this.filterStockList.subscribe();
        if (v && v instanceof Object && v.id) {
          const filterProduct = this.stockList.map(
            item => {
              const stock = new ApiStockDefinitionResponse(item);
              const comp1 = this.companyLists.filter(r => r.id === stock.incomingCompanyId);
              const comp2 = this.companyLists.filter(r => r.id === stock.outgoingCompanyId);
              const proj = this.projectLists.filter(r => r.id === stock.projectId);
              stock.incomingCompanyName = comp1.length > 0 ? comp1[0].name : 'Bilinmeyen Şirket';
              stock.outgoingCompanyName = comp2.length > 0 ? comp2[0].name : 'Bilinmeyen Şirket';
              stock.projectName = proj.length > 0 ? proj[0].name : 'Bilinmeyen Proje';
              stock.confirmById = stock.confirmById !== null ?
                this.userList.filter(r => r.objectSid === stock.confirmById)[0].displayName : null;
              return stock;
            }).filter(r => r.invoiceNo === v.invoiceNo);
          this.filterStockList = of(filterProduct);
        }
        if (v === null || v === '') {
          this.filterStockList = this.filterStockList2;
          this.filterStockList.subscribe();
        }
      });
  }

  public onPageChange(evt): void {
    this.pageNumber.setValue(evt);
  }

  public openStockModal(stock, item: ApiStockDefinitionResponse): void {
    this.modalHeader = 'Stok Detay';
    this.invoiceNo = this.stockList.filter(r => r.invoiceNo === item.invoiceNo)[0].invoiceNo;
    const receiverUser = this.stockList.filter(r => r.receiver === item.receiver)[0].receiver;
    this.receiverId = this.userList.filter(r => r.objectSid === receiverUser)[0];
    const deliveryUser = this.stockList.filter(r => r.deliveryPerson === item.deliveryPerson)[0].deliveryPerson;
    this.deliveryPersonId = this.userList.filter(r => r.objectSid === deliveryUser)[0];
    this.note = this.stockList.filter(r => r.id === item.id)[0].note;
    this.getStockProduct(item.id);
    this.modalService.open(stock, { centered: true });
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
                this.backendService.getStockHistory(request)
                  .subscribe(res => {
                    if (res.error.code === 0) {
                      this.stockList = res.data;
                      if (this.backendService.currentUser().isSupervisor) {
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
                              stock.confirmById = stock.confirmById !== null ?
                                this.userList.filter(r => r.objectSid === stock.confirmById)[0].displayName : null;
                              return stock;
                            }));
                      }
                      else {
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
                              stock.confirmById = stock.confirmById !== null ?
                                this.userList.filter(r => r.objectSid === stock.confirmById)[0].displayName : null;
                              return stock;
                            }).filter(v => v.receiver === this.backendService.currentUser().objectSid));
                      }
                      this.filterStockList2 = this.filterStockList;
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

  public selectProperty(propertyName: string): (o: any) => string | undefined {
    return (o: any) => (o || {})[propertyName];
  }
}
