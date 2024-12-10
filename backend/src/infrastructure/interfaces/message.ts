import { Message } from "@prisma/client";

export interface IMessage {
    getByConversation(conversationId: string, limit?: number, before?: Date): Promise<Message[]>;
    create(data: {
        content: string;
        senderId: string;
        conversationId: string;
    }): Promise<Message>;
    update(id: string, content: string): Promise<Message>;
    markAsDeleted(id: string): Promise<Message>;
}
