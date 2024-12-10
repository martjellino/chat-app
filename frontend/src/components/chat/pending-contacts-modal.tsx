import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingContacts: any[];
    onAccept: (contactId: string) => void;
    onReject: (contactId: string) => void;
}

export const PendingContactsModal = ({
    isOpen,
    onClose,
    pendingContacts,
    onAccept,
    onReject
}: PendingContactsModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pending Contact Requests ({pendingContacts.length})</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {pendingContacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="flex items-center justify-between p-3 bg-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-blue-400 border-2 border-black flex items-center justify-center text-white font-bold">
                                    {contact.contact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold">{contact.contact.name}</p>
                                    <p className="text-sm text-gray-600">{contact.contact.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => onAccept(contact.id)}
                                    className="bg-green-400 hover:bg-green-500"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onReject(contact.id)}
                                    className="bg-red-400 hover:bg-red-500"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {pendingContacts.length === 0 && (
                        <p className="text-center text-gray-500">No pending requests</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
