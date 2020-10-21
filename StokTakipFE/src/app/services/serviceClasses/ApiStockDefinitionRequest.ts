import { ApiStockProductItem } from './ApiStockProductItem';

export interface ApiStockDefinitionRequest {
    invoiceNo: string;
    projectId: string;
    incomingCompanyId: string;
    outgoingCompanyId: string;
    shippingCompanyId: string;
    shippingUserId: string;
    productRows: ApiStockProductItem[];
    date: Date;
    receiverId: string;
    deliveryPersonId: string;
    deleted: boolean;
    file: string[];
    fileTitles: string[];
}
