export interface ApiCompanyDefinitionResponse {
    id: string;
    name: string;
    taxNo: string;
    address: string;
    eposta: string;
    phone: string;
    webSite: string;
    users: string[];
    isShipping: boolean;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiCompanyDefinitionResponse implements ApiCompanyDefinitionResponse {
    id: string;
    name: string;
    taxNo: string;
    address: string;
    eposta: string;
    phone: string;
    webSite: string;
    isShipping: boolean;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiCompanyDefinitionResponse) {
        if (!o || !o.id) {
            return;
        }
        this.id = o.id;
        this.name = o.name;
        this.taxNo = o.taxNo;
        this.address = o.address;
        this.eposta = o.eposta;
        this.phone = o.phone;
        this.webSite = o.webSite;
        this.isShipping = o.isShipping;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}
