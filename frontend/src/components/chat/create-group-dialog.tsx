import React, { useState } from 'react';
import { Users, X, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/chat-context';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error';

interface Contact {
    id: string;
    contactId: string;
    contact: {
        name: string;
    };
}

interface CreateGroupDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateGroupDialog = ({ isOpen, onClose }: CreateGroupDialogProps ) => {
    const [groupName, setGroupName] = useState<string>('');
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const { contacts, createGroupChat } = useChat();

    const acceptedContacts = contacts.filter(contact => contact.status === 'ACCEPTED');

    const handleCreateGroup = async (): Promise<void> => {
        if (!groupName.trim() || selectedContacts.length === 0) {
            toast.error('Please enter a group name and select at least one contact');
            return;
        }

        setIsCreating(true);
        try {
            await createGroupChat(
                groupName.trim(),
                selectedContacts.map(contact => contact.contactId)
            );
            toast.success('Group created successfully');
            handleClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = (): void => {
        setGroupName('');
        setSelectedContacts([]);
        onClose();
    };

    const toggleContact = (contact: Contact): void => {
        setSelectedContacts(prev =>
            prev.some(c => c.id === contact.id)
                ? prev.filter(c => c.id !== contact.id)
                : [...prev, contact]
        );
    };

    const isContactSelected = (contactId: string): boolean => {
        return selectedContacts.some(c => c.id === contactId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users size={20} />
                        Create New Group
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-bold">
                            Select Members ({selectedContacts.length} selected):
                        </label>
                        <div className="max-h-60 overflow-y-auto space-y-2 px-5 pb-4">
                            {acceptedContacts.map((contact) => {
                                const isSelected = isContactSelected(contact.id);
                                return (
                                    <div
                                        key={contact.id}
                                        onClick={() => toggleContact(contact)}
                                        className={`
                                            flex items-center gap-3 p-3 cursor-pointer
                                            border-2 border-black rounded-md
                                            ${isSelected
                                                ? 'bg-purple-100 shadow-none translate-x-[3px] translate-y-[3px]'
                                                : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                            }
                                            transition-all
                                        `}
                                        role="button"
                                        tabIndex={0}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                toggleContact(contact);
                                            }
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-md bg-purple-400 border-2 border-black flex items-center justify-center text-white font-bold">
                                            {contact.contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium">{contact.contact.name}</span>
                                        {isSelected ? (
                                            <X size={16} className="ml-auto" />
                                        ) : (
                                            <Plus size={16} className="ml-auto" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button
                        onClick={handleCreateGroup}
                        disabled={isCreating || !groupName.trim() || selectedContacts.length === 0}
                        className="w-full bg-main "
                    >
                        {isCreating ? "Creating..." : "Create Group"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};