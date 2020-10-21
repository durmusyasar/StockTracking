export interface ApiProductDefinitionResponse {
    id: string;
    name: string;
    barcodeNo: string;
    criticalLevel: number;
    inStock: number;
    genus: string;
    categoryId: string;
    categoryName?: string;
    subCategoryName?: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiProductDefinitionResponse implements ApiProductDefinitionResponse {
    id: string;
    name: string;
    barcodeNo: string;
    criticalLevel: number;
    inStock: number;
    genus: string;
    categoryId: string;
    categoryName?: string;
    subCategoryName?: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiProductDefinitionResponse) {
        if (!o || !o.id) {
            return;
        }
        this.id = o.id;
        this.name = o.name;
        this.barcodeNo = o.barcodeNo;
        this.criticalLevel = o.criticalLevel;
        this.inStock = o.inStock;
        this.genus = o.genus;
        this.categoryId = o.categoryId;
        this.categoryName = o.categoryName;
        this.subCategoryName = o.subCategoryName;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}
