'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import Sidebar from '@/components/layout/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import WelcomeScreen from '@/components/chat/WelcomeScreen';
import api from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { activeRoom, setRooms } = useChatStore();
  const isHydrated = useAuthStore.persist?.hasHydrated?.() ?? true;
  useSocket(); // Initialize socket connection

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) { router.push('/login'); return; }
    // Load user rooms
    api.get('/rooms').then(({ data }) => setRooms(data)).catch(console.error);
  }, [token, isHydrated]);

  if (!isHydrated || !user) return null;

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {activeRoom ? <ChatWindow /> : <WelcomeScreen />}
      </main>
    </div>
  );
}
