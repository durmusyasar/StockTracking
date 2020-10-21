import { ApiStockProductItem } from './ApiStockProductItem';

export interface ApiStockDefinitionResponse {
    id: string;
    invoiceNo: string;
    projectId: string;
    projectName: string;
    incomingCompanyId: string;
    incomingCompanyName: string;
    outgoingCompanyId: string;
    outgoingCompanyName: string;
    productRows: ApiStockProductItem[];
    date: Date;
    receiver: string;
    deliveryPerson: string;
    confirmStatus: boolean;
    confirmById: string;
    note: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiStockDefinitionResponse implements ApiStockDefinitionResponse {
    id: string;
    invoiceNo: string;
    projectId: string;
    projectName: string;
    incomingCompanyId: string;
    incomingCompanyName: string;
    outgoingCompanyId: string;
    outgoingCompanyName: string;
    productRows: ApiStockProductItem[];
    date: Date;
    receiver: string;
    deliveryPerson: string;
    confirmStatus: boolean;
    confirmById: string;
    note: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiStockDefinitionResponse) {
        if (!o || !o.id) {
            return;
        }
        this.id = o.id;
        this.invoiceNo = o.invoiceNo;
        this.projectId = o.projectId;
        this.projectName = o.projectName;
        this.incomingCompanyId = o.incomingCompanyId;
        this.incomingCompanyName = o.incomingCompanyName;
        this.outgoingCompanyId = o.outgoingCompanyId;
        this.outgoingCompanyName = o.outgoingCompanyName;
        this.productRows = o.productRows;
        this.date = o.date;
        this.receiver = o.receiver;
        this.deliveryPerson = o.deliveryPerson;
        this.confirmStatus = o.confirmStatus;
        this.confirmById = o.confirmById;
        this.note = o.note;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}
