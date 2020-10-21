export interface ApiProductDefinitionRequest {
    id?: string;
    name: string;
    barcodeNo?: string;
    criticalLevel: number;
    genus: string;
    categoryId: string;
    deleted: boolean;
}
