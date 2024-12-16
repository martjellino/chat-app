// src/context/chat-context.tsx
"use client";

import { ApiError, getErrorMessage } from "@/lib/error";
import { createContext, useContext, useState, useOptimistic, useCallback, startTransition } from "react";
import { useAuth } from "./auth-context";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    conversationId: string;  // Add this field
}

interface Conversation {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name?: string;
    participants: Participant[];  // Array of Participant objects, not just {id, name}
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
}

interface ContactWithUser {
    id: string;
    userId: string;
    contactId: string;
    status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
    contact: User;    // This matches your backend response structure
}

interface Participant {
    id: string;
    userId: string;
    user: User;
    role: string;
    // conversationId: string;
}

interface ChatContextType {
    conversations: Conversation[];
    currentChat: Conversation | null;
    messages: Message[];
    contacts: ContactWithUser[];  // Update this type
    setContacts: (contacts: ContactWithUser[]) => void;
    setCurrentChat: (chat: Conversation | null) => void;
    setConversations: (conversations: Conversation[]) => void; // Add this
    fetchContacts: () => Promise<void>;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    addContact: (email: string) => Promise<void>;
    createDirectChat: (userId: string) => Promise<void>;
    createGroupChat: (name: string, participantIds: string[]) => Promise<void>;
    sendMessage: (conversationId: string, content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [contacts, setContacts] = useState<ContactWithUser[]>([]);

    // Optimistic update for messages
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [optimisticMessages, addOptimisticMessage] = useOptimistic<
        Message[],
        { content: string; conversationId: string }
    >(messages, (state, { content, conversationId }) => [
        ...state,
        {
            id: `temp-${Date.now()}`,
            content,
            senderId: user?.id || '',
            conversationId,
            createdAt: new Date().toISOString(),
        },
    ]);

    const reorderConversations = useCallback((conversationId: string, lastMessage: Message) => {
        setConversations(prev => {
            // Find and update the conversation with new message
            const updatedConversations = prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, lastMessage, updatedAt: lastMessage.createdAt }
                    : conv
            );

            // Sort conversations by latest message/update time
            return updatedConversations.sort((a, b) => {
                const timeA = a.lastMessage?.createdAt || a.updatedAt;
                const timeB = b.lastMessage?.createdAt || b.updatedAt;
                return new Date(timeB).getTime() - new Date(timeA).getTime();
            });
        });
    }, []);

    const handleApiResponse = async (response: Response) => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `Request failed with status ${response.status}`
            }));
            throw new ApiError(
                errorData.message || 'Request failed',
                response.status,
                errorData.code
            );
        }
        return response.json();
    };

    const fetchContacts = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/contacts`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }

            const data = await response.json();
            console.log('Fetched contacts:', data); // Add this log to debug

            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/conversations`, {
                credentials: 'include',
            });
            const data = await handleApiResponse(response);
    
            // Sort conversations by latest message or updatedAt
            const sortedData = [...data].sort((a, b) => {
                const timeA = a.lastMessage?.createdAt || a.updatedAt;
                const timeB = b.lastMessage?.createdAt || b.updatedAt;
                return new Date(timeB).getTime() - new Date(timeA).getTime();
            });
    
            // Only update if there are actual changes
            setConversations(prev => {
                const prevJson = JSON.stringify(prev);
                const newJson = JSON.stringify(sortedData);
                return prevJson === newJson ? prev : sortedData;
            });
        } catch (error: unknown) {
            throw new ApiError(getErrorMessage(error));
        }
    }, []);

    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
                credentials: 'include',
            });
            const data = await handleApiResponse(response);

            setMessages(data);

            // If there are messages, update conversation order
            if (data.length > 0) {
                const lastMessage = data[data.length - 1];
                reorderConversations(conversationId, lastMessage);
            }
        } catch (error) {
            throw new ApiError(getErrorMessage(error));
        }
    }, [reorderConversations]);



    const addContact = async (email: string) => {
        try {
            const response = await fetch(`${API_URL}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add contact');
            }

            await fetchContacts(); // Refresh contacts list
        } catch (error: unknown) {
            throw new ApiError(getErrorMessage(error));
        }
    };

    const createDirectChat = async (userId: string) => {
        try {
            const response = await fetch(`${API_URL}/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    type: 'DIRECT',
                    participantIds: [userId]
                }),
            });
            const newChat = await handleApiResponse(response);
            setConversations(prev => [...prev, newChat]);
            setCurrentChat(newChat);
        } catch (error: unknown) {
            throw new ApiError(getErrorMessage(error));
        }
    };

    const setContactsSafely = useCallback((newContacts: ContactWithUser[]) => {
        setContacts(prev => {
            const areContactsEqual = JSON.stringify(prev) === JSON.stringify(newContacts);
            return areContactsEqual ? prev : newContacts;
        });
    }, []);

    const createGroupChat = async (name: string, participantIds: string[]) => {
        try {
            const response = await fetch(`${API_URL}/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    type: 'GROUP',
                    name,
                    participantIds
                }),
            });

            const newChat = await handleApiResponse(response);

            // Update conversations and set current chat
            setConversations(prev => [...prev, newChat]);
            setCurrentChat(newChat);
        } catch (error) {
            throw new ApiError(getErrorMessage(error));
        }
    };

    const sendMessage = useCallback(async (conversationId: string, content: string) => {
        if (!user) throw new Error('User not authenticated');
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            content,
            senderId: user.id,
            conversationId,
            createdAt: new Date().toISOString()
        };
    
        try {
            // Optimistic update
            startTransition(() => {
                addOptimisticMessage({ content, conversationId });
                reorderConversations(conversationId, tempMessage);
            });

    
            setConversations(prev => {
                const updated = prev.map(conv => 
                    conv.id === conversationId 
                        ? { ...conv, lastMessage: tempMessage, updatedAt: tempMessage.createdAt }
                        : conv
                ).sort((a, b) => {
                    const timeA = a.lastMessage?.createdAt || a.updatedAt;
                    const timeB = b.lastMessage?.createdAt || b.updatedAt;
                    return new Date(timeB).getTime() - new Date(timeA).getTime();
                });
                return updated;
            });
    
            // Send actual message
            const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content }),
            });
    
            if (!response.ok) throw new Error('Failed to send message');
            const newMessage = await response.json();
    
            // Update with real message
            setMessages(prev => 
                prev.map(msg => msg.id === tempId ? newMessage : msg)
            );
    
            // Update conversations with real message
            setConversations(prev => {
                const updated = prev.map(conv => 
                    conv.id === conversationId 
                        ? { ...conv, lastMessage: newMessage, updatedAt: newMessage.createdAt }
                        : conv
                ).sort((a, b) => {
                    const timeA = a.lastMessage?.createdAt || a.updatedAt;
                    const timeB = b.lastMessage?.createdAt || b.updatedAt;
                    return new Date(timeB).getTime() - new Date(timeA).getTime();
                });
                return updated;
            });
    
            const messageEvent = new CustomEvent('newMessage', { detail: newMessage });
            window.dispatchEvent(messageEvent);
    
        } catch (error) {
            // Revert optimistic updates
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            await fetchConversations(); // Refresh conversations on error
            throw error;
        }
    }, [user, addOptimisticMessage, fetchConversations]);

    return (
        <ChatContext.Provider value={{
            conversations,
            currentChat,
            messages: optimisticMessages, // Use optimistic messages instead
            contacts,
            setContacts: setContactsSafely,
            setCurrentChat,
            setConversations,
            fetchContacts,
            fetchConversations,
            fetchMessages,
            addContact,
            createDirectChat,
            createGroupChat,
            sendMessage,
        }}>
            {children}
        </ChatContext.Provider>
    );
} export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};