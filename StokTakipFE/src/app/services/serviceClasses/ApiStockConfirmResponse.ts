
export interface ApiStockConfirmResponse {
    id: string;
    serialNo: string;
    productId: string;
    productName: string;
    stockProductName: string;
    quantity: string;
    department: string;
}

export class ApiStockConfirmResponse implements ApiStockConfirmResponse {
    id: string;
    serialNo: string;
    productId: string;
    productName: string;
    stockProductName: string;
    quantity: string;
    department: string;

    constructor(o: ApiStockConfirmResponse) {
        if (!o || !o.serialNo) {
            return;
        }
        this.serialNo = o.serialNo;
        this.id = o.id;
        this.productId = o.productId;
        this.productName = o.productName;
        this.stockProductName = o.stockProductName;
        this.quantity = o.quantity;
        this.department = o.department;
    }
}
