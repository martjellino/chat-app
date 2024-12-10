'use client';

import { MessageSquare } from "lucide-react";
import Link from "next/link";

export const Dashboard = () => {


    return (
        <div className="min-h-screen bg-purple-200 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Hero Section */}
                <div className="bg-blue-200 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-500 border-4 border-black rounded-lg flex items-center justify-center">
                            <MessageSquare size={32} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-center text-black mb-4">
                        Welcome to ChatApp
                    </h1>
                    <p className="text-blue-800 font-medium text-center text-lg max-w-2xl mx-auto">
                        Connect with friends and colleagues in a simple, secure, and stylish way.
                    </p>
                </div>

                {/* Auth Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/register">
                        <div className="bg-orange-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6
                            hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <h2 className="text-2xl font-black text-black mb-2">Register</h2>
                            <p className="text-black font-medium">
                                New here? Create an account to start connecting with anither users.
                            </p>
                        </div>
                    </Link>
                    <Link href="/login">
                        <div className="bg-green-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6
                            hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <h2 className="text-2xl font-black text-black mb-2">Login</h2>
                            <p className="text-black font-medium">
                                Already have an account? Sign in to continue chatting.
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-blue-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
                        <h3 className="text-xl font-black text-black mb-2">Real-time Chat</h3>
                        <p className="text-gray-700 font-medium">
                            Instant messaging with real-time updates and notifications.
                        </p>
                    </div>

                    <div className="bg-purple-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
                        <h3 className="text-xl font-black text-black mb-2">Group Chats</h3>
                        <p className="text-gray-700 font-medium">
                            Create and manage group conversations with multiple participants.
                        </p>
                    </div>

                    <div className="bg-yellow-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
                        <h3 className="text-xl font-black text-black mb-2">Contact Management</h3>
                        <p className="text-gray-700 font-medium">
                            Easily manage your contacts and chat preferences.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 font-medium">
                        Made with 💜 by @martjellino
                    </p>
                </div>
            </div>
        </div>
    );
}
