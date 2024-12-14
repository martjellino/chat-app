// src\infrastructure\interfaces\conversation.ts

import { Conversation, Message, Participant, User } from "@prisma/client";

export type ConversationWithRelations = Conversation & {
    messages: Message[];
    participants: (Participant & {
        user: {
            id: string;
            name: string;
            email: string;
            avatar: string | null;
            status: string;
        }
    })[];
}

export interface IConversation {
    getAllByUser(userId: string): Promise<ConversationWithRelations[]>;
    getById(id: string): Promise<Conversation | null>;
    create(data: {
        type: string;
        name?: string;
        createdBy: string;
        participantIds: string[];
    }): Promise<Conversation>;
    delete(id: string): Promise<void>;
}
