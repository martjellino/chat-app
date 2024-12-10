import "reflect-metadata";
import { inject, injectable } from "inversify";
import { ConversationRepository } from "../../infrastructure/repositories/conversation";
import { ParticipantRepository } from "../../infrastructure/repositories/participant";
import { TYPES } from "../../infrastructure/types";
import { Conversation, Participant, PrismaClient } from "@prisma/client";

type ConversationType = 'DIRECT' | 'GROUP';

interface CreateConversationInput {
    type: ConversationType;
    name?: string;
    createdBy: string;
    participantIds: string[];
}

type ConversationWithParticipants = Conversation & {
    participants: (Participant & {
        user: {
            id: string;
            name: string;
        }
    })[];
};

@injectable()
export class ConversationService {
    private conversationRepo: ConversationRepository;
    private participantRepo: ParticipantRepository;

    constructor(
        @inject(TYPES.conversationRepo) conversationRepo: ConversationRepository,
        @inject(TYPES.participantRepo) participantRepo: ParticipantRepository
    ) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
    }

    public async getAllUserConversations(userId: string) {
        return await this.conversationRepo.getAllByUser(userId);
    }

    public async getConversationById(id: string, userId: string) {
        const conversation = await this.conversationRepo.getById(id);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const participants = await this.participantRepo.getByConversationId(conversation.id);
        if (!Array.isArray(participants)) {
            throw new Error("Invalid participants data");
        }

        const isParticipant = participants.some(p => p.userId === userId);
        if (!isParticipant) {
            throw new Error("Not authorized to view this conversation");
        }

        return { ...conversation, participants };
    }

    public async createConversation(data: CreateConversationInput) {
        // Ensure creator is in participants
        if (!data.participantIds.includes(data.createdBy)) {
            data.participantIds.push(data.createdBy);
        }

        // For direct chats, ensure only 2 participants
        if (data.type === "DIRECT" && data.participantIds.length !== 2) {
            throw new Error("Direct conversations must have exactly 2 participants");
        }

        return await this.conversationRepo.create(data);
    }

    public async addParticipants(conversationId: string, participantIds: string[], userId: string) {
        const conversation = await this.conversationRepo.getById(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Fetch participants separately
        const participants = await this.participantRepo.getByConversationId(conversation.id);

        // Check if participants is an array
        if (!Array.isArray(participants)) {
            throw new Error("Invalid participants data");
        }

        // Check if user is admin
        const userParticipant = participants.find(p => p.userId === userId);
        if (!userParticipant || userParticipant.role !== "ADMIN") {
            throw new Error("Only admins can add participants");
        }

        if (conversation.type === "DIRECT") {
            throw new Error("Cannot add participants to direct conversations");
        }

        // Add participants
        for (const participantId of participantIds) {
            await this.participantRepo.create({
                conversationId,
                userId: participantId,
                role: "MEMBER"
            });
        }
    }

    public async removeParticipant(conversationId: string, participantId: string, userId: string) {
        const conversation = await this.conversationRepo.getById(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Fetch participants separately
        const participants = await this.participantRepo.getByConversationId(conversation.id);

        // Check if participants is an array
        if (!Array.isArray(participants)) {
            throw new Error("Invalid participants data");
        }

        // Check if the user performing the action is an admin
        const userParticipant = participants.find(p => p.userId === userId);
        if (!userParticipant || userParticipant.role !== "ADMIN") {
            throw new Error("Only admins can remove participants");
        }

        // Cannot remove participants from direct conversations
        if (conversation.type === "DIRECT") {
            throw new Error("Cannot remove participants from direct conversations");
        }

        // Find the participant to remove
        const participant = await this.participantRepo.findByUserAndConversation(
            participantId,
            conversationId
        );
        if (!participant) {
            throw new Error("Participant not found");
        }

        // Cannot remove the last admin
        const isLastAdmin =
            participant.role === "ADMIN" &&
            participants.filter(p => p.role === "ADMIN" && !p.leftAt).length <= 1;

        if (isLastAdmin) {
            throw new Error("Cannot remove the last admin from the conversation");
        }

        // Mark participant as left
        await this.participantRepo.markAsLeft(participant.id);

    }
}