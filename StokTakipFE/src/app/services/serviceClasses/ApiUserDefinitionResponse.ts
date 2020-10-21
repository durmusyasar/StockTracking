export interface ApiUserDefinitionResponse {
    objectSid: string;
    accountName: string;
    firstName: string;
    lastName: string;
    displayName: string;
    userPrincipalName: string;
    mobile: string;
    ipPhone: string;
    telephoneNumber: string;
    email: string;
    company: string;
    department: string;
    thumbnailPhoto: string;
    password: string;
    birtOfDate: Date;
    about: string;
    genus: boolean;
    userPhoto: string;
    authorityLevel: number;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiUserDefinitionResponse implements ApiUserDefinitionResponse {
    objectSid: string;
    accountName: string;
    firstName: string;
    lastName: string;
    displayName: string;
    userPrincipalName: string;
    mobile: string;
    ipPhone: string;
    telephoneNumber: string;
    email: string;
    company: string;
    department: string;
    thumbnailPhoto: string;
    password: string;
    birtOfDate: Date;
    about: string;
    genus: boolean;
    userPhoto: string;
    authorityLevel: number;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiUserDefinitionResponse) {
        if (!o || !o.objectSid) {
            return;
        }
        this.objectSid = o.objectSid;
        this.firstName = o.firstName;
        this.lastName = o.lastName;
        this.displayName = o.displayName;
        this.accountName = o.accountName;
        this.userPrincipalName = o.userPrincipalName;
        this.ipPhone = o.ipPhone;
        this.mobile = o.mobile;
        this.telephoneNumber = o.telephoneNumber;
        this.email = o.email;
        this.department = o.department;
        this.company = o.company;
        this.thumbnailPhoto = o.thumbnailPhoto;
        this.birtOfDate = o.birtOfDate;
        this.password = o.password;
        this.about = o.about;
        this.genus = o.genus;
        this.userPhoto = o.userPhoto;
        this.authorityLevel = o.authorityLevel;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}
