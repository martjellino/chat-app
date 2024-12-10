"use client";

import { ChatProvider } from "@/context/chat-context";
import RequireAuth from "@/components/auth/require-auth";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <ChatProvider>{children}</ChatProvider>
    </RequireAuth>
  );
}