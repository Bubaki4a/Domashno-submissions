export abstract class Response {
    protected success: boolean;
    protected data: any;
    protected message: string;

    constructor(success: boolean, data: any, message: string) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

}