// components/chat/chat.tsx
'use client';

import { useCallback, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useChat } from "@/context/chat-context";
import Sidebar from "./sidebar";
import ChatWindow from "./chat-window";
import { ChatProps } from "@/types/chat";


export default function Chat({ initialContacts }: ChatProps) {
    const { setContacts, fetchContacts, fetchConversations } = useChat();
    const initializeChat = useCallback(async () => {
        try {
            setContacts(initialContacts);
            await fetchConversations();
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        }
    }, [initialContacts, setContacts, fetchConversations]);

    // Set up polling for contacts and conversations
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout;

        const pollUpdates = async () => {
            try {
                await fetchContacts();
                await fetchConversations();
            } catch (error) {
                console.error('Error polling updates:', error);
            }
        };

        // Initial load
        initializeChat();

        // Set up polling every 3 seconds
        // eslint-disable-next-line prefer-const
        pollingInterval = setInterval(pollUpdates, 3000);

        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [initializeChat, fetchContacts, fetchConversations]);

    


    const { currentChat } = useChat(); // Separate hook call for currentChat

    return (
        <div className="flex justify-center w-full min-h-screen bg-purple-200 p-4">
            <div className="flex w-full max-w-[1920px] h-[calc(100vh-2rem)] bg-yellow-50 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-[20%] min-w-[300px] border-r-4 border-black">
                    <Sidebar />
                </div>
                <div className="w-[80%]">
                    {currentChat ? <ChatWindow /> : <WelcomeScreen />}
                </div>
            </div>
        </div>
    );
}

const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full bg-yellow-50">
        <div className="p-8 bg-blue-200 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-md transform -rotate-2 hover:rotate-0 transition-all">
            <div className="w-16 h-16 mb-6 mx-auto bg-blue-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md flex items-center justify-center">
                <MessageSquare size={32} className="text-black" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-center">
                Welcome to Chat!
            </h2>
            <p className="text-sm font-bold text-blue-800 text-center px-4">
                Select a conversation from the sidebar to start chatting
            </p>
        </div>
    </div>
);