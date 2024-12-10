import "reflect-metadata";
import { Contact, PrismaClient } from "@prisma/client";
import { injectable } from "inversify";
import { prisma } from "../utils/prisma";
import { IContact } from "../interfaces/contact";

@injectable()
export class ContactRepository implements IContact {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = prisma;
    }

    async getAllByUser(userId: string): Promise<Contact[]> {
        return await this.prisma.contact.findMany({
            where: {
                userId,
            },
            include: {
                contact: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        status: true,
                    },
                },
            },
        });
    }

    async getContact(userId: string, contactId: string): Promise<Contact | null> {
        return await this.prisma.contact.findFirst({
            where: {
                userId,
                contactId,
            },
        });
    }

    async getByID(id: string): Promise<Contact | null> {
        return await this.prisma.contact.findUnique({
            where: { id },
        });
    }

    async create(userId: string, contactId: string): Promise<Contact> {
        return await this.prisma.contact.create({
            data: {
                userId,
                contactId,
            },
            include: {
                contact: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        status: true,
                    },
                },
            },
        });
    }

    async updateStatus(id: string, status: string): Promise<Contact> {
        return await this.prisma.contact.update({
            where: { id },
            data: { status },
            include: {
                contact: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        status: true,
                    },
                },
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.contact.delete({
            where: { id },
        });
    }
}