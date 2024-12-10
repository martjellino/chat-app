import { Conversation } from "@prisma/client";

export interface IConversation {
    getAllByUser(userId: string): Promise<Conversation[]>;
    getById(id: string): Promise<Conversation | null>;
    create(data: {
        type: string;
        name?: string;
        createdBy: string;
        participantIds: string[];
    }): Promise<Conversation>;
    delete(id: string): Promise<void>;
}
