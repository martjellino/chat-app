// types/chat.ts
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
}

export interface Participant {
    id: string;
    userId: string;
    user: User;
    role: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name?: string;
    participants: Participant[];
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
}

export interface Contact {
    id: string;
    userId: string;
    contactId: string;
    status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
    contact: User;
}

export type ContactStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export interface ChatProps {
    initialContacts: Contact[];
}