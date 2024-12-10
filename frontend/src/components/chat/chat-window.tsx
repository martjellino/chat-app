// components/chat/chat-window.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { format } from 'date-fns';
import { Send, Paperclip } from "lucide-react";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { Message } from "@/types/chat";
import { ChatHeader } from "./chat-header";
import React from "react";

export default function ChatWindow() {
    const { user } = useAuth();
    const { currentChat, messages, sendMessage, fetchMessages } = useChat();
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Group messages by date
    const groupedMessages = React.useMemo(() => {
        if (!messages) return [];

        const groups: { [key: string]: Message[] } = {};
        [...messages]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .forEach(message => {
                const date = format(new Date(message.createdAt), 'dd MMMM yyyy');
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(message);
            });

        return Object.entries(groups);
    }, [messages]);

    useEffect(() => {
        let pollingInterval: NodeJS.Timeout;

        const fetchAndUpdateMessages = async () => {
            if (currentChat?.id) {
                try {
                    await fetchMessages(currentChat.id);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        if (currentChat?.id) {
            fetchAndUpdateMessages();
            pollingInterval = setInterval(fetchAndUpdateMessages, 3000);
        }

        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [currentChat?.id, fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || sending || !currentChat) return;

        const messageContent = message;
        setMessage("");
        setSending(true);

        try {
            await sendMessage(currentChat.id, messageContent);
        } catch (error) {
            toast.error(getErrorMessage(error));
            setMessage(messageContent);
        } finally {
            setSending(false);
        }
    };

    const MessageBubble = ({ msg }: { msg: Message }) => {
        const isOwnMessage = msg.senderId === user?.id;
        const sender = currentChat?.participants.find(p => p.user.id === msg.senderId)?.user;

        return (
            <div className={`flex items-start gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-md bg-violet-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                            {sender?.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <div
                    className={`
                        max-w-[70%] p-4 rounded-lg
                        ${isOwnMessage
                            ? "bg-gradient-to-br from-indigo-500 to-blue-500 -rotate-1"
                            : "bg-gradient-to-r from-violet-500 to-purple-500 rotate-1"
                        }
                        border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                        transform transition-transform hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                        ${msg.id.startsWith('temp-') ? "opacity-70" : ""}
                    `}
                >
                    {!isOwnMessage && (
                        <p className="text-xs text-white mb-1 font-medium">
                            {sender?.name}
                        </p>
                    )}
                    <p className="font-bold text-white">{msg.content}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <span className="text-sm text-white font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                        {msg.id.startsWith('temp-') && (
                            <span className="w-3 h-3 rounded-md border border-black bg-black animate-pulse" />
                        )}
                    </div>
                </div>
                {/* {isOwnMessage && (
                    <div className="w-8 h-8 rounded-md bg-blue-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                            {user?.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )} */}
            </div>
        );
    };

    if (!currentChat) return null;

    return (
        <div className="flex flex-col h-full bg-yellow-50">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col space-y-6">
                    {groupedMessages.map(([date, dayMessages]) => (
                        <div key={date} className="space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-white px-4 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <span className="text-sm font-bold text-gray-700">
                                        {date}
                                    </span>
                                </div>
                            </div>
                            {dayMessages.map((msg) => (
                                <MessageBubble key={msg.id} msg={msg} />
                            ))}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="border-t-4 border-black p-4 bg-green-100">
                <div className="flex items-center space-x-3">
                    <button className="p-3 bg-purple-400 hover:bg-purple-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">
                        <Paperclip size={20} className="text-black" />
                    </button>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 px-4 py-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none transition-all focus:outline-none placeholder:text-gray-500 font-medium"
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || sending}
                        className={`p-3 rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
                            ${message.trim() && !sending
                                ? "bg-blue-400 hover:bg-blue-500 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
                                : "bg-gray-200"
                            }`}
                    >
                        <Send
                            size={20}
                            className={message.trim() && !sending ? "text-black" : "text-gray-500"}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}