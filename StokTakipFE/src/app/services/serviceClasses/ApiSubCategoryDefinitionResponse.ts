export interface ApiSubCategoryDefinitionResponse{
    parentName: string;
    parentId: string;
    childName: string;
    childId: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiSubCategoryDefinitionResponse implements ApiSubCategoryDefinitionResponse {
    parentName: string;
    parentId: string;
    childName: string;
    childId: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiSubCategoryDefinitionResponse) {
        if (!o || !o.childId) {
            return;
        }
        this.parentName = o.parentName;
        this.parentId = o.parentId;
        this.childName = o.childName;
        this.childId = o.childId;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}
