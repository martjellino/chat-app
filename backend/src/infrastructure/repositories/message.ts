import "reflect-metadata";
import { Message, PrismaClient } from "@prisma/client";
import { injectable } from "inversify";
import { prisma } from "../utils/prisma";
import { IMessage } from "../interfaces/message";
// import { IMessage } from "@/infrastructure/interfaces/message";
// import { prisma } from "@/infrastructure/utils/prisma";


@injectable()
export class MessageRepository implements IMessage {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = prisma;
    }

    async getByConversation(conversationId: string, limit: number = 50, before?: Date): Promise<Message[]> {
        return await this.prisma.message.findMany({
            where: {
                conversationId,
                createdAt: before ? { lt: before } : undefined,
                isDeleted: false,
            },
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                readBy: true,
            },
        });
    }

    async create(data: { content: string; senderId: string; conversationId: string }): Promise<Message> {
        return await this.prisma.message.create({
            data,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async update(id: string, content: string): Promise<Message> {
        return await this.prisma.message.update({
            where: { id },
            data: {
                content,
                isEdited: true,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async markAsDeleted(id: string): Promise<Message> {
        return await this.prisma.message.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });
    }
}