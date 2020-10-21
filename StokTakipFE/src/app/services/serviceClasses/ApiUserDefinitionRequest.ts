import { ApiCompanyDefinitionRequest } from './ApiCompanyDefinitionRequest';

export interface ApiUserDefinitionRequest {
    objectSid: string;
    password: string;
    displayName: string;
    accountName: string;
    firstName: string;
    lastName: string;
    userPrincipalName: string;
    mobile: string;
    ipPhone: string;
    department: string;
    company: ApiCompanyDefinitionRequest;
    telephoneNumber: string;
    birtOfDate: Date;
    genus: boolean;
    about: string;
    userPhoto: string;
    deleted: boolean;
    authorityLevel: number;
}
