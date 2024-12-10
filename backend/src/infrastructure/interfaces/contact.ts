import { Contact } from "@prisma/client";

export interface IContact {
    getAllByUser(userId: string): Promise<Contact[]>;
    getContact(userId: string, contactId: string): Promise<Contact | null>;
    getByID(id: string): Promise<Contact | null>;
    create(userId: string, contactId: string): Promise<Contact>;
    updateStatus(id: string, status: string): Promise<Contact>;
    delete(id: string): Promise<void>;
}