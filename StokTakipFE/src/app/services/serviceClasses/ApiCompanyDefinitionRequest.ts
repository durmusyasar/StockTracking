export interface ApiCompanyDefinitionRequest {
    id?: string;
    name: string;
    taxNo?: string;
    address: string;
    eposta?: string;
    phone: string;
    webSite: string;
    deleted: boolean;
    isShipping: boolean;
}
