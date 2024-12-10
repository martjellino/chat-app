// contact-modal.tsx
import { useState, useEffect } from "react";
import { Users, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChat } from "@/context/chat-context";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Contact {
    id: string;
    userId: string;
    contactId: string;
    status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
    contact: User;
}

interface ContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartChat: (contactId: string) => void;
}

export default function ContactsModal({ isOpen, onClose, onStartChat }: ContactsModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { fetchContacts, contacts } = useChat();

    useEffect(() => {
        const loadContacts = async () => {
            if (isOpen) {
                setIsLoading(true);
                try {
                    await fetchContacts();
                } catch (error) {
                    console.error('Error fetching contacts:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadContacts();
    }, [isOpen, fetchContacts]);

    // Filter accepted contacts and search results
    const acceptedContacts = contacts.filter(contact => contact.status === 'ACCEPTED');

    const filteredContacts = acceptedContacts.filter(contact => {
        const searchTerm = searchQuery.toLowerCase();
        const contactName = contact.contact.name.toLowerCase();
        const contactEmail = contact.contact.email.toLowerCase();

        return contactName.includes(searchTerm) || contactEmail.includes(searchTerm);
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md min-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users size={20} />
                        Contacts ({acceptedContacts.length})
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <div className="p-2">
                        <Input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mb-4"
                        />

                        <div className="space-y-2 overflow-y-auto h-full pr-2">
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">
                                    Loading contacts...
                                </div>
                            ) : (
                                <>
                                    {filteredContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            onClick={() => {
                                                if (contact.status === 'ACCEPTED') {
                                                    onStartChat(contact.contactId);
                                                    onClose();
                                                } else {
                                                    toast.info('Contact request is pending');
                                                }
                                            }}
                                            className={`flex items-center gap-3 p-3 bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
            ${contact.status === 'ACCEPTED'
                                                    ? 'hover:bg-yellow-50 cursor-pointer'
                                                    : 'opacity-70 cursor-not-allowed'
                                                } transition-all`}
                                        >
                                            <div className="w-10 h-10 rounded-md bg-blue-400 border-2 border-black flex items-center justify-center text-white font-bold">
                                                {contact.contact.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold">
                                                    {contact.contact.name}
                                                    {contact.status !== 'ACCEPTED' && (
                                                        <span className="ml-2 text-xs bg-yellow-200 px-2 py-0.5 rounded-full text-yellow-800">
                                                            Pending
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600">{contact.contact.email}</p>
                                            </div>
                                            <MessageSquare size={20} className="ml-auto text-gray-500" />
                                        </div>
                                    ))}

                                    {filteredContacts.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            {searchQuery ? 'No contacts found' : 'No contacts yet'}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}