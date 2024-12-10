// components/chat/chat-header.tsx
import { MoreVertical, UserPlus, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";


export function ChatHeader() {
    const { user } = useAuth();
    const { currentChat, contacts, setCurrentChat } = useChat();
    const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
    const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

    if (!currentChat) return null;

    const getChatName = () => {
        if (currentChat.type === "GROUP") return currentChat.name;

        const otherParticipant = currentChat.participants.find(
            p => p.user.id !== user?.id
        );
        return otherParticipant?.user.name || "Unknown User";
    };

    const getChatStatus = () => {
        if (currentChat.type === "GROUP") {
            return `${currentChat.participants.length} participants`;
        }
        return "Direct Message";
    };

    const handleAddParticipants = async () => {
        try {
            const response = await fetch(`http://localhost:7000/conversations/${currentChat.id}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ participantIds: selectedContacts }),
            });

            if (!response.ok) throw new Error('Failed to add participants');

            toast.success('Participants added successfully');
            setIsAddParticipantsOpen(false);
            setSelectedContacts([]);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleLeaveGroup = async () => {
        try {
            const response = await fetch(`http://localhost:7000/conversations/${currentChat.id}/leave`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to leave group');

            setCurrentChat(null);
            toast.success('Left group successfully');
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleClearChat = async () => {
        try {
            const response = await fetch(`http://localhost:7000/conversations/${currentChat.id}/messages`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to clear chat');

            toast.success('Chat cleared successfully');
            setIsConfirmClearOpen(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    // Get contacts that aren't already in the group
    const availableContacts = contacts.filter(contact =>
        contact.status === 'ACCEPTED' &&
        !currentChat.participants.some(p => p.user.id === contact.contactId)
    );

    return (
        <div className="p-4 border-b-4 border-black bg-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-md bg-blue-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white font-bold">
                    {getChatName()?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="font-bold text-black">{getChatName()}</h2>
                    <span className="text-sm font-medium text-blue-800">
                        {getChatStatus()}
                    </span>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 bg-purple-400 hover:bg-purple-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">
                        <MoreVertical size={20} className="text-black" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {currentChat.type === 'GROUP' && (
                        <>
                            <DropdownMenuItem
                                onClick={() => setIsAddParticipantsOpen(true)}
                                className="flex items-center gap-2 font-medium hover:bg-blue-100 cursor-pointer"
                            >
                                <UserPlus size={18} className="text-blue-600" />
                                Add Participants
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setIsConfirmLeaveOpen(true)}
                                className="flex items-center gap-2 font-medium hover:bg-orange-100 cursor-pointer"
                            >
                                <LogOut size={18} className="text-orange-600" />
                                Leave Group
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-black" />
                        </>
                    )}
                    <DropdownMenuItem
                        onClick={() => setIsConfirmClearOpen(true)}
                        className="flex items-center gap-2 font-medium hover:bg-red-100 cursor-pointer"
                    >
                        <Trash2 size={18} className="text-red-600" />
                        Clear Chat
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Participants Dialog */}
            <Dialog open={isAddParticipantsOpen} onOpenChange={setIsAddParticipantsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Participants</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-60 overflow-y-auto space-y-5 px-5 pb-4">
                        {availableContacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => {
                                    setSelectedContacts(prev =>
                                        prev.includes(contact.contactId)
                                            ? prev.filter(id => id !== contact.contactId)
                                            : [...prev, contact.contactId]
                                    );
                                }}
                                className={`
                                    flex items-center gap-3 p-3 cursor-pointer border-2 border-black rounded-md
                                    ${selectedContacts.includes(contact.contactId)
                                        ? 'bg-purple-100 shadow-none translate-x-[3px] translate-y-[3px]'
                                        : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    }
                                    transition-all
                                `}
                            >
                                <div className="w-8 h-8 rounded-md bg-purple-400 border-2 border-black flex items-center justify-center text-white font-bold">
                                    {contact.contact.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{contact.contact.name}</span>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={handleAddParticipants}
                        disabled={selectedContacts.length === 0}
                        className="w-full pt-4"
                    >
                        Add Selected Participants
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Confirm Leave Dialog */}
            <Dialog open={isConfirmLeaveOpen} onOpenChange={setIsConfirmLeaveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Group</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave this group? You won&apos;t be able to see any new messages.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="neutral"
                            onClick={() => setIsConfirmLeaveOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLeaveGroup}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Leave Group
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Clear Chat Dialog */}
            <Dialog open={isConfirmClearOpen} onOpenChange={setIsConfirmClearOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear Chat</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to clear all messages? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="neutral"
                            onClick={() => setIsConfirmClearOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleClearChat}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Clear Chat
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}