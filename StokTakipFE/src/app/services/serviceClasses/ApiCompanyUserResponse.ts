export interface ApiCompanyUserResponse {
    displayName: string;
    objectSid: string;
    department: string;
    thumbnailPhoto: string;
    userPhoto: string;
    phone: string;
    mobile: string;
    email: string;
}

export class ApiCompanyUserResponse implements ApiCompanyUserResponse {
    displayName: string;
    objectSid: string;
    department: string;
    thumbnailPhoto: string;
    userPhoto: string;
    phone: string;
    mobile: string;
    email: string;


    constructor(o: ApiCompanyUserResponse) {
        if (!o || !o.objectSid) {
            return;
        }
        this.displayName = o.displayName;
        this.objectSid = o.objectSid;
        this.department = o.department;
        this.thumbnailPhoto = o.thumbnailPhoto;
        this.userPhoto = o.userPhoto;
        this.mobile = o.mobile;
        this.email = o.email;
    }
}
