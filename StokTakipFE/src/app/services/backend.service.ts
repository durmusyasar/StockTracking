import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MonoTypeOperatorFunction, Observable, of, pipe } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { ApiResponse } from './serviceClasses/ApiResponse';
import { GenericApiResponse } from './serviceClasses/GenericApiResponse';
import { ApiUser } from './serviceClasses/ApiUser';
import { ApiCategoryDefinitionResponse } from './serviceClasses/ApiCategoryDefinitionResponse';
import { ApiCategoryDefinitionRequest } from './serviceClasses/ApiCategoryDefinitionRequest';
import { ApiSubCategoryDefinitionResponse } from './serviceClasses/ApiSubCategoryDefinitionResponse';
import { ApiCompanyDefinitionRequest } from './serviceClasses/ApiCompanyDefinitionRequest';
import { ApiCompanyDefinitionResponse } from './serviceClasses/ApiCompanyDefinitionResponse';
import { ApiProductDefinitionResponse } from './serviceClasses/ApiProductDefinitionResponse';
import { ApiProductDefinitionRequest } from './serviceClasses/ApiProductDefinitionRequest';
import { ApiProfileDefinitionRequest } from './serviceClasses/ApiProfileDefinitionRequest';
import { ApiProfileDefinitionResponse } from './serviceClasses/ApiProfileDefinitionResponse';
import { ApiProfileAccountDefinitionResponse } from './serviceClasses/ApiProfileAccountDefinitionResponse';
import { ApiProjectDefinitionResponse } from './serviceClasses/ApiProjectDefinitionResponse';
import { ApiProjectDefinitionRequest } from './serviceClasses/ApiProjectDefinitionRequest';
import { ApiStockDefinitionRequest } from './serviceClasses/ApiStockDefinitionRequest';
import { ApiStockDefinitionResponse } from './serviceClasses/ApiStockDefinitionResponse';
import { ApiStockConfirmResponse } from './serviceClasses/ApiStockConfirmResponse';
import { ApiStockConfirmRequest } from './serviceClasses/ApiStockConfirmRequest';
import { ApiCompanyUserResponse } from './serviceClasses/ApiCompanyUserResponse';
import { ApiUserDefinitionRequest } from './serviceClasses/ApiUserDefinitionRequest';
import { ApiUserDefinitionResponse } from './serviceClasses/ApiUserDefinitionResponse';
import { GenericPaginatedApiResponse } from './serviceClasses/GenericPaginatedApiResponse';
import { PaginationResponse } from './serviceClasses/PaginationResponse';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  user: ApiUser;
  private apiBaseUri = '/api';
  // private apiBaseUri = 'https://localhost:44352/api';
  public empytGuid = '00000000-0000-0000-0000-000000000000';
  private responseCache: any = {};
  private responseCacheTimeTable: any = {};
  private cacheTimeout: number = 5 * 60 * 1000;

  constructor(
    private httpClient: HttpClient,
    private sanitzier: DomSanitizer
  ) { }

  private cacheResponse<T extends ApiResponse>(uri: string): MonoTypeOperatorFunction<T> {
    return tap<T>(response => {
      this.responseCache[uri] = response;
      this.responseCacheTimeTable[uri] = Date.now();
      return response;
    });
  }

  public b64toBlob(b64Data, contentType = '', sliceSize = 512): any {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return this.sanitzier.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  }

  public currentUser(): ApiUser {
    if (!this.user) {
      this.user = JSON.parse(localStorage.getItem('currentUser'));
      if (!!this.user) {
        this.user.thumbnailPhoto = this.user.thumbnailPhoto ?
        this.user.thumbnailPhoto :
          null;
      }
    }
    return this.user;
  }

  // tslint:disable-next-line:typedef
  private pipeFn<T extends ApiResponse>(absoluteUri: string = null, useCache: boolean = false) {
    return pipe(
      useCache ? this.cacheResponse<T>(absoluteUri) : map(v => v),
      debounceTime(350),
      distinctUntilChanged(),
    );
  }

  private get<T extends ApiResponse>(uri: string, useCache: boolean = false): Observable<T> {
    const absoluteUri = `${this.apiBaseUri}/${uri}`;
    return useCache && absoluteUri in this.responseCache
      && (Date.now() - (this.responseCacheTimeTable[absoluteUri] as number)) < this.cacheTimeout ?
      of(this.responseCache[absoluteUri]) :
      this.httpClient
        .get<T>(absoluteUri)
        .pipe(
          this.pipeFn(absoluteUri, useCache),
        );
  }

  private post<T extends ApiResponse>(url: string, data: any): Observable<T> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.httpClient
      .post<T>(`${this.apiBaseUri}/${url}`, data, { headers: httpHeaders })
      .pipe(
        this.pipeFn<T>(),
      );
  }

  //#region Login - Logout

  public login(accountName: string, password: string): Observable<any> {
    return this.post<any>(`login`, { accountName, password })
      .pipe(map(response => {
        if (response.error.code === 0) {
          const user = response.data;
          if (user && user.token) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.user = user;
            if (!!this.user.thumbnailPhoto) {
              this.user.thumbnailPhoto = this.user.thumbnailPhoto;
            } else {
              this.user.userPhoto = this.user.userPhoto;
            }
          }
        }
        return response;
      }));
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.user = null;
  }

  //#endregion

  //#region  Category

  public getCategoryList(data: PaginationResponse): Observable<GenericPaginatedApiResponse<ApiSubCategoryDefinitionResponse[]>> {
    return this.post<GenericPaginatedApiResponse<ApiSubCategoryDefinitionResponse[]>>('definitions/categoryList', data);
  }

  public getCategories(useCache: boolean = false): Observable<GenericApiResponse<ApiCategoryDefinitionResponse[]>> {
    return this.get<GenericApiResponse<ApiCategoryDefinitionResponse[]>>('definitions/categories', useCache);
  }

  public getSubCategoryList(useCache: boolean = false): Observable<GenericApiResponse<ApiCategoryDefinitionResponse[]>> {
    return this.get<GenericApiResponse<ApiCategoryDefinitionResponse[]>>('definitions/subCategoryList', useCache);
  }

  public saveCategory(data: ApiCategoryDefinitionRequest): Observable<GenericApiResponse<ApiCategoryDefinitionResponse[]>> {
    return this.post<GenericApiResponse<ApiCategoryDefinitionResponse[]>>(`definitions/saveCategory`, data);
  }

  public getSubCategories(useCache: boolean = false): Observable<GenericApiResponse<ApiSubCategoryDefinitionResponse[]>> {
    return this.get<GenericApiResponse<ApiSubCategoryDefinitionResponse[]>>('definitions/subCategories', useCache);
  }

  //#endregion

  //#region Company

  public getCompanyList(data: PaginationResponse): Observable<GenericPaginatedApiResponse<ApiCompanyDefinitionResponse[]>> {
    return this.post<GenericPaginatedApiResponse<ApiCompanyDefinitionResponse[]>>('definitions/companyList', data);
  }

  public getCompanies(useCache: boolean = false): Observable<GenericApiResponse<ApiCompanyDefinitionResponse[]>> {
    return this.get<GenericApiResponse<ApiCompanyDefinitionResponse[]>>('definitions/companies', useCache);
  }

  public getCompanyUser(companyId: string): Observable<GenericApiResponse<ApiCompanyUserResponse[]>> {
    return this.post<GenericApiResponse<ApiCompanyUserResponse[]>>(`definitions/companyUser/${companyId}`, companyId);
  }

  public getUserCompany(userId: string): Observable<GenericApiResponse<ApiCompanyDefinitionResponse[]>> {
    return this.post<GenericApiResponse<ApiCompanyDefinitionResponse[]>>(`definitions/userCompany/${userId}`, userId);
  }

  public saveCompany(data: ApiCompanyDefinitionRequest): Observable<GenericApiResponse<ApiCompanyDefinitionResponse[]>> {
    return this.post<GenericApiResponse<ApiCompanyDefinitionResponse[]>>(`definitions/saveCompany`, data);
  }

  //#endregion

  //#region Product
  public getProductList(data: PaginationResponse): Observable<GenericPaginatedApiResponse<ApiProductDefinitionResponse[]>> {
    return this.post<GenericPaginatedApiResponse<ApiProductDefinitionResponse[]>>('definitions/ProductList', data);
  }

  public getProducts(useCache: boolean = false): Observable<GenericApiResponse<ApiProductDefinitionResponse[]>> {
    return this.get<GenericApiResponse<ApiProductDefinitionResponse[]>>('definitions/products', useCache);
  }

  public saveProduct(data: ApiProductDefinitionRequest): Observable<GenericApiResponse<ApiProductDefinitionResponse[]>> {
    return this.post<GenericApiResponse<ApiProductDefinitionResponse[]>>(`definitions/saveProduct`, data);
  }

  //#endregion

  //#region Profile

  public getUserProfile(userName: string): Observable<GenericApiResponse<ApiProfileDefinitionResponse>> {
    return this.get<GenericApiResponse<ApiProfileDefinitionResponse>>(`definitions/profile/${userName}`);
  }

  // tslint:disable-next-line:max-line-length
  public getUserAccountProfile(userId: string, useCache: boolean = true): Observable<GenericApiResponse<ApiProfileAccountDefinitionResponse>> {
    return this.post<GenericApiResponse<ApiProfileAccountDefinitionResponse>>(`definitions/account/${userId}`, useCache);
  }

  public saveUserProfile(data: ApiProfileDefinitionRequest): Observable<GenericApiResponse<ApiProfileDefinitionResponse[]>> {
    return this.post<GenericApiResponse<ApiProfileDefinitionResponse[]>>(`definitions/saveUserProfile`, data);
  }

  //#endregion

  //#region Project
  public getProjectList(data: PaginationResponse): Observable<GenericPaginatedApiResponse<ApiProjectDefinitionResponse[]>> {
    return this.post<GenericPaginatedApiResponse<ApiProjectDefinitionResponse[]>>('definitions/ProjectList', data);
  }

  public getProjects(useCache: boolean = false): Observable<GenericApiResponse<ApiProjectDefinitionResponse[]>> {
    return this.get<GenericApiResponse<ApiProjectDefinitionResponse[]>>('definitions/projects', useCache);
  }

  public saveProject(data: ApiProjectDefinitionRequest): Observable<GenericApiResponse<ApiProjectDefinitionResponse[]>> {
    return this.post<GenericApiResponse<ApiProjectDefinitionResponse[]>>(`definitions/saveProject`, data);
  }

  //#endregion

  //#region User

  public getUserList(data: PaginationResponse): Observable<GenericPaginatedApiResponse<ApiUserDefinitionResponse[]>> {
    return this.post<GenericPaginatedApiResponse<ApiUserDefinitionResponse[]>>('definitions/userList', data);
  }

  public getUsers(): Observable<GenericApiResponse<ApiUserDefinitionResponse[]>> {
    return this.get<GenericApiResponse<ApiUserDefinitionResponse[]>>('definitions/users');
  }

  public saveUser(data: ApiUserDefinitionRequest): Observable<GenericApiResponse<ApiUserDefinitionResponse[]>> {
    return this.post<GenericApiResponse<ApiUserDefinitionResponse[]>>(`definitions/saveUser`, data);
  }

  //#endregion

  //#region Stock

  public getStockList(userId: string, data: PaginationResponse): Observable<GenericPaginatedApiResponse<ApiStockDefinitionResponse[]>>{
    return this.post<GenericPaginatedApiResponse<ApiStockDefinitionResponse[]>>(`definitions/stockList/${userId}`, data);
  }

  public getStockHistory(data: PaginationResponse): Observable<GenericPaginatedApiResponse<ApiStockDefinitionResponse[]>> {
    return this.post<GenericPaginatedApiResponse<ApiStockDefinitionResponse[]>>('definitions/stockHistory', data);
  }

  public getStockProduct(stockId: string): Observable<GenericApiResponse<ApiStockConfirmResponse[]>> {
    return this.post<GenericApiResponse<ApiStockConfirmResponse[]>>(`definitions/stockProduct/${stockId}`, stockId);
  }

  public saveStock(data: ApiStockDefinitionRequest): Observable<GenericApiResponse<ApiResponse>> {
    return this.post<GenericApiResponse<ApiResponse>>(`definitions/saveStock`, data);
  }

  public confirmStock(data: ApiStockConfirmRequest): Observable<GenericApiResponse<ApiResponse>> {
    return this.post<GenericApiResponse<ApiResponse>>(`definitions/confirmStock`, data);
  }

  //#endregion

}
