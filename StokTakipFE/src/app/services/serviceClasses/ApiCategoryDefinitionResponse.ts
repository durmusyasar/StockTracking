export interface ApiCategoryDefinitionResponse {
    id: string;
    type: number;
    name: string;
    parentId: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiCategoryDefinitionResponse implements ApiCategoryDefinitionResponse {
    id: string;
    type: number;
    name: string;
    parentId: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiCategoryDefinitionResponse) {
        if (!o || !o.id) {
            return;
        }
        this.id = o.id;
        this.type = o.type;
        this.name = o.name;
        this.parentId = o.parentId;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}
