// components/chat/sidebar.tsx

'use client'
import { useCallback, useEffect, useState } from "react";
import { Search, LogOut, UserPlus, Check, X, Users, MoreVertical } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/error";
import ContactsModal from "./contact-modal";
import { useRouter } from "next/navigation"; // Add this import
import { CreateGroupDialog } from "./create-group-dialog";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
}

interface Participant {
    id: string;
    userId: string;
    user: User;    // Include the full user object
    role: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
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

// type ContactStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [localUser, setLocalUser] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });
    const { conversations, contacts, currentChat, setCurrentChat, addContact, createDirectChat, fetchContacts } = useChat();
    const [searchQuery, setSearchQuery] = useState("");
    const [newContactEmail, setNewContactEmail] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
    const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
    const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
    const router = useRouter();

    // Helper function to get chat display name
    const getChatName = (conversation: Conversation): string => {
        if (!conversation) return 'Unknown';

        if (conversation.type === 'GROUP' && conversation.name) {
            return conversation.name;
        }

        if (conversation.type === 'DIRECT' && conversation.participants) {
            const otherParticipant = conversation.participants.find(
                participant => participant.user.id !== user?.id
            );

            return otherParticipant?.user.name || 'Unknown User';
        }

        return 'Unnamed Chat';
    };
    const handleAddContact = async () => {
        if (!newContactEmail.trim()) return;

        setIsAdding(true);
        try {
            await addContact(newContactEmail);
            setNewContactEmail("");
            toast.success("Contact added successfully");
            setIsAddContactDialogOpen(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsAdding(false);
        }
    };

    const handleStartChat = async (contactId: string) => {
        try {
            // Check if contact is accepted
            const contact = contacts.find(c => c.contactId === contactId);

            if (!contact || contact.status !== 'ACCEPTED') {
                toast.error('Please accept the contact request first');
                return;
            }

            await createDirectChat(contactId);
            toast.success("Chat created successfully");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const updateContactStatus = async (contactId: string, status: string) => {
        try {
            // Debug to see the actual contact object
            const contactToUpdate = contacts.find(c => c.id === contactId);
            console.log('Contact to update:', contactToUpdate);

            // Use contact.id for the relationship ID, not the user's ID
            const response = await fetch(`http://localhost:7000/contacts/${contactId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    status
                }),
            });

            const responseData = await response.json();
            console.log('Response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update contact status');
            }

            await fetchContacts();
            toast.success("Contact status updated");
        } catch (error) {
            console.error('Error details:', {
                error,
                contactId,
                status,
                fullContactObject: contacts.find(c => c.id === contactId)
            });
            toast.error(getErrorMessage(error));
        }
    };

    const filteredConversations = conversations
        .filter(conv => {
            const chatName = getChatName(conv).toLowerCase();
            return chatName.includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
            if (a.lastMessage && b.lastMessage) {
                return new Date(b.lastMessage.createdAt).getTime() -
                    new Date(a.lastMessage.createdAt).getTime();
            }
            return new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime();
        });

    // Separate contacts by status
    const pendingContacts = contacts.filter(contact =>
        contact.status === 'PENDING' &&
        contact.userId === localUser?.id // Only show requests where the current user is the receiver
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const acceptedContacts = contacts.filter(contact => contact.status === 'ACCEPTED');

    useEffect(() => {
        // This will run whenever conversations array changes
        const sortedConversations = [...conversations].sort((a, b) => {
            // If there are last messages, sort by last message time
            if (a.lastMessage && b.lastMessage) {
                return new Date(b.lastMessage.createdAt).getTime() -
                    new Date(a.lastMessage.createdAt).getTime();
            }
            // If no last messages, sort by conversation creation/update time
            return new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime();
        });

        // Update current chat if needed (to maintain selection after sorting)
        if (currentChat) {
            const updatedCurrentChat = sortedConversations.find(conv => conv.id === currentChat.id);
            if (updatedCurrentChat) {
                setCurrentChat(updatedCurrentChat);
            }
        }
    }, [conversations]); // Dependency array includes conversations to react to changes

    const handleLogout = useCallback(async () => {
        try {
            // Call auth context logout first
            await logout();
            
            // Clear client state
            setCurrentChat(null);
            setSearchQuery("");
            setLocalUser(null);
    
            // Navigate to login page
            router.replace('/login');
        } catch (error) {
            toast.error(getErrorMessage(error));
            console.error('Logout error:', error);
        }
    }, [logout, router, setCurrentChat]);


    return (
        <div className="flex flex-col h-full bg-yellow-50 border-r-4 border-black">
            {/* Profile header */}
            <div className="px-4 py-3 bg-blue-200 border-b-4 border-black flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white font-bold">
                        {localUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-bold text-black">{localUser?.name}</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="neutral"
                            size="icon"
                            className="relative bg-purple-400 hover:bg-purple-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
                        >
                            <MoreVertical size={20} className="text-black" />
                            {pendingContacts.length > 0 && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{pendingContacts.length}</span>
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-72 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {/* Regular menu items */}
                        <DropdownMenuItem
                            onClick={() => setIsAddContactDialogOpen(true)}
                            className="flex items-center gap-2 font-medium hover:bg-green-100 cursor-pointer"
                        >
                            <UserPlus size={18} className="text-green-600" />
                            Add Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setIsCreateGroupDialogOpen(true)}
                            className="flex items-center gap-2 font-medium hover:bg-purple-100 cursor-pointer"
                        >
                            <Users size={18} className="text-purple-600" />
                            Create Group
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => setIsContactsModalOpen(true)}
                            className="flex relative items-center gap-2 font-medium hover:bg-blue-100 cursor-pointer"
                        >
                            <Users size={18} className="text-blue-600" />
                            View Contacts
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 font-medium hover:bg-red-100 cursor-pointer"
                        >
                            <LogOut size={18} className="text-red-600" />
                            Logout
                        </DropdownMenuItem>

                        {/* Pending Contacts Section */}
                        {pendingContacts.length > 0 && (
                            <>
                                <DropdownMenuSeparator className="bg-black" />
                                <div className="px-2 py-1">
                                    <h3 className="text-sm font-black text-orange-600 mb-2">Pending Contact Requests</h3>
                                    <div className="space-y-2">
                                        {pendingContacts.map((contact) => (
                                            <div
                                                key={contact.id}
                                                className="flex items-center justify-between p-2 bg-white border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-md bg-orange-400 border-2 border-black flex items-center justify-center text-white font-bold">
                                                        {contact.contact.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{contact.contact.name}</p>
                                                        <p className="text-xs text-gray-600">{contact.contact.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="neutral"
                                                        size="icon"
                                                        className="h-6 w-6 bg-green-400 hover:bg-green-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                                        onClick={() => {
                                                            console.log('Contact object:', contact); // Debug log
                                                            updateContactStatus(contact.id, 'ACCEPTED');
                                                        }}
                                                    >
                                                        <Check size={12} className="text-black" />
                                                    </Button>
                                                    <Button
                                                        variant="neutral"
                                                        size="icon"
                                                        className="h-6 w-6 bg-red-400 hover:bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                                        onClick={() => {
                                                            console.log('Contact object:', contact); // Debug log
                                                            updateContactStatus(contact.id, 'BLOCKED');
                                                        }}
                                                    >
                                                        <X size={12} className="text-black" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Search bar */}
            <div className="p-3">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search conversations"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-1.5 pl-10 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 text-black" size={18} />
                </div>
            </div>

            {/* Add Contact Dialog */}
            <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Contact</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <Input
                            placeholder="Enter email address"
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                        />
                        <Button
                            onClick={handleAddContact}
                            disabled={isAdding || !newContactEmail.trim()}
                            className="w-full"
                        >
                            {isAdding ? "Adding..." : "Add Contact"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Contacts Modal */}
            <ContactsModal
                isOpen={isContactsModalOpen}
                onClose={() => setIsContactsModalOpen(false)}
                onStartChat={handleStartChat}
            />

            <CreateGroupDialog
                isOpen={isCreateGroupDialogOpen}
                onClose={() => setIsCreateGroupDialogOpen(false)}
            />

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => setCurrentChat(conv)}
                        className={`flex items-center p-3 cursor-pointer border-b-2 border-black hover:bg-blue-100 transition-colors
                            ${currentChat?.id === conv.id ? "bg-blue-100" : ""}`}
                    >
                        <div className="w-12 h-12 rounded-md bg-purple-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 flex items-center justify-center text-white font-bold">
                            {getChatName(conv).charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold truncate">{getChatName(conv)}</h3>
                                {conv.lastMessage && (
                                    <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded-md border border-black">
                                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                )}
                            </div>
                            {conv.lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                    {conv.lastMessage.content}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}