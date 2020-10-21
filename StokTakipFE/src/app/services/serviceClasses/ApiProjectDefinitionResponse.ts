export interface ApiProjectDefinitionResponse {
    id: string;
    name: string;
    companyId: string;
    companyName: string;
    givenManager: string;
    givenManagerName: string;
    receivedManager: string;
    receivedManagerName: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiProjectDefinitionResponse implements ApiProjectDefinitionResponse {
    id: string;
    name: string;
    companyId: string;
    givenManager: string;
    receivedManager: string;
    companyName: string;
    givenManagerName: string;
    receivedManagerName: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiProjectDefinitionResponse) {
        if (!o || !o.id) {
            return;
        }
        this.id = o.id;
        this.name = o.name;
        this.companyId = o.companyId;
        this.companyName = o.companyName;
        this.givenManager = o.givenManager;
        this.givenManagerName = o.givenManagerName;
        this.receivedManager = o.receivedManager;
        this.receivedManagerName = o.receivedManagerName;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}

