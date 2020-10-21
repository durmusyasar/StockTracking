export interface ApiUser {
    objectSid: string;
    accountName: string;
    firstName: string;
    lastName: string;
    displayName: string;
    userPrincipalName: string;
    mobile: string;
    ipPhone: string;
    telephoneNumber: string;
    city: string;
    semt: string;
    email: string;
    company: string;
    department: string;
    title: string;
    streetAddress: string;
    postalCode: string;
    wWWHomePage: string;
    thumbnailPhoto: string;
    token: string;
    agentOf: string[];
    adminOf: string[];
    userOf: string[];
    userPhoto: string;
    isSupervisor: boolean;
    isWarehouseWorker: boolean;
    isUser: boolean;
}

