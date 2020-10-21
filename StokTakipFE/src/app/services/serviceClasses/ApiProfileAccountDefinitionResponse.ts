export interface ApiProfileAccountDefinitionResponse {
    userId: string;
    linkedinAccount?: string;
    googleAccount?: string;
    facebookAccount?: string;
    twitterAccount?: string;
    instagramAccount?: string;
    bloggerAccount?: string;
    youtubeAccount?: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;
}

export class ApiProfileAccountDefinitionResponse implements ApiProfileAccountDefinitionResponse {
    userId: string;
    linkedinAccount?: string;
    googleAccount?: string;
    facebookAccount?: string;
    twitterAccount?: string;
    instagramAccount?: string;
    bloggerAccount?: string;
    youtubeAccount?: string;
    lastUpdate?: Date;
    editedBy?: string;
    deleted: boolean;
    createdBy?: string;
    createdDate?: Date;

    constructor(o: ApiProfileAccountDefinitionResponse) {
        if (!o || !o.userId) {
            return;
        }
        this.userId = o.userId;
        this.linkedinAccount = o.linkedinAccount;
        this.googleAccount = o.googleAccount;
        this.facebookAccount = o.facebookAccount;
        this.twitterAccount = o.twitterAccount;
        this.instagramAccount = o.instagramAccount;
        this.bloggerAccount = o.bloggerAccount;
        this.youtubeAccount = o.youtubeAccount;
        this.lastUpdate = o.lastUpdate;
        this.editedBy = o.editedBy;
        this.deleted = o.deleted;
        this.createdBy = o.createdBy;
        this.createdDate = o.createdDate;
    }
}
