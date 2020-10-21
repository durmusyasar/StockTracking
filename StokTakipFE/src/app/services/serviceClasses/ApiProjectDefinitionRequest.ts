export interface ApiProjectDefinitionRequest{
    id?: string;
    name: string;
    companyId: string;
    givenManager: string;
    receivedManager: string;
    deleted: boolean;
}
