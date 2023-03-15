export abstract class MessageTemplate {
    public abstract messageInput: object;

    public templateId: string;

    constructor(templateId: string) {
        this.templateId = templateId;
    }
}
