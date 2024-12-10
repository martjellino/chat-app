import Chat from '@/components/chat/chat'
import React from 'react'
import { cookies } from 'next/headers';

async function getContacts() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    const response = await fetch('http://localhost:7000/contacts', {
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
