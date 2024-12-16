import Chat from '@/components/chat/chat'
import React from 'react'
import { cookies } from 'next/headers';

async function getContacts() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    const response = await fetch(`${API_URL}/contacts`, {
      headers: {
        Cookie: `session=${sessionCookie?.value || ''}`,
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export default async function Page() {
  const initialContacts = await getContacts();

  return (
    <div>
      <Chat initialContacts={initialContacts} />
    </div>
  )
}
