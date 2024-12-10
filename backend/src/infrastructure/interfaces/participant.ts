import { Participant } from "@prisma/client";

export interface IParticipant {
    findByConversation(conversationId: string): Promise<Participant[]>;
    findByUserAndConversation(userId: string, conversationId: string): Promise<Participant | null>;
    create(data: { userId: string; conversationId: string; role: string }): Promise<Participant>;
    updateRole(id: string, role: string): Promise<Participant>;
    markAsLeft(id: string): Promise<Participant>;
}