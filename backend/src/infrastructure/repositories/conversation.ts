// src/infrastructure/repositories/conversation.ts
import "reflect-metadata";
import { Conversation, PrismaClient, User } from "@prisma/client";
import { injectable } from "inversify";
import { ConversationWithRelations, IConversation } from "../interfaces/conversation";
import { prisma } from "../utils/prisma";

@injectable()
export class ConversationRepository implements IConversation {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = prisma;
    }

    async getAllByUser(userId: string): Promise<ConversationWithRelations[]> {
        try {
            const conversations = await this.prisma.conversation.findMany({
                where: {
                    participants: {
                        some: {
                            userId: userId,
                        },
                    },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    avatar: true,
                                    status: true,
                                },
                            },
                        },
                    },
                    messages: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        where: {
                            isDeleted: false
                        },
                        take: 1,
                    },
                },
            });

            // Sort conversations based on their latest message or updatedAt
            return conversations.sort((a, b) => {
                const aTime = a.messages[0]?.createdAt || a.updatedAt;
                const bTime = b.messages[0]?.createdAt || b.updatedAt;
                return bTime.getTime() - aTime.getTime();
            });
        } catch (error) {
            throw new Error(`Failed to get conversations: ${error}`);
        }
    }

    async getById(id: string): Promise<Conversation | null> {
        try {
            return await this.prisma.conversation.findUnique({
                where: { id },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    avatar: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error(`Failed to get conversation: ${error}`);
        }
    }

    async create(data: {
        type: 'DIRECT' | 'GROUP';
        name?: string;
        createdBy: string;
        participantIds: string[];
    }): Promise<Conversation> {
        try {
            // Validate participant count for DIRECT chats
            if (data.type === 'DIRECT' && data.participantIds.length !== 2) {
                throw new Error('Direct conversations must have exactly 2 participants');
            }

            // Check for existing direct conversation
            if (data.type === 'DIRECT') {
                const existingConversation = await this.prisma.conversation.findFirst({
                    where: {
                        type: 'DIRECT',
                        AND: [
                            {
                                participants: {
                                    some: {
                                        userId: data.participantIds[0],
                                        leftAt: null,
                                    },
                                },
                            },
                            {
                                participants: {
                                    some: {
                                        userId: data.participantIds[1],
                                        leftAt: null,
                                    },
                                },
                            },
                        ],
                    },
                });

                if (existingConversation) {
                    throw new Error('Direct conversation already exists between these users');
                }
            }

            return await this.prisma.conversation.create({
                data: {
                    type: data.type,
                    name: data.name,
                    createdBy: data.createdBy,
                    participants: {
                        create: data.participantIds.map((id: string) => ({
                            userId: id,
                            role: id === data.createdBy ? 'ADMIN' : 'MEMBER',
                        })),
                    },
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    avatar: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error(`Failed to create conversation: ${error}`);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.conversation.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error(`Failed to delete conversation: ${error}`);
        }
    }
}