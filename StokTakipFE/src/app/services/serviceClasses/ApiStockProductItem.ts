import { ApiProductDefinitionResponse } from './ApiProductDefinitionResponse';

export interface ApiStockProductItem {
    serialNo: string;
    productName: ApiProductDefinitionResponse;
    stockProductName: string;
    quantity: string;
    department: string;
}

export class ApiStockProductItem implements ApiStockProductItem {
    serialNo: string;
    productName: ApiProductDefinitionResponse;
    stockProductName: string;
    quantity: string;
    department: string;

    constructor(o: ApiStockProductItem) {
        if (!o || !o.serialNo) {
            return;
        }
        this.serialNo = o.serialNo;
        this.productName = o.productName;
        this.stockProductName = o.stockProductName;
        this.quantity = o.quantity;
        this.department = o.department;
    }
}
