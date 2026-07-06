import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

let socketInstance: Socket | null = null;
let socketToken: string | null = null;

export const useSocket = () => {
  const { token } = useAuthStore();
  const {
    addMessage, setTyping, setUserOnline, updateMessageReadBy,
  } = useChatStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    if (socketInstance && socketToken !== token) {
      socketInstance.disconnect();
      socketInstance = null;
      socketToken = null;
    }

    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      socketToken = token;
    }

    socketRef.current = socketInstance;
    const socket = socketInstance;

    socket.on('connect', () => console.log('🟢 Socket connected'));
    socket.on('disconnect', () => console.log('🔴 Socket disconnected'));

    socket.on('message:new', ({ room, ...message }: any) => {
      addMessage(room || message.room, message);
    });

    socket.on('typing:start', ({ userId, username, roomId }: any) => {
      setTyping(roomId, { userId, username }, true);
    });

    socket.on('typing:stop', ({ userId, roomId }: any) => {
      setTyping(roomId, { userId, username: '' }, false);
    });

    socket.on('user:online', ({ userId, isOnline }: any) => {
      setUserOnline(userId, isOnline);
    });

    socket.on('message:read', ({ messageIds, userId, roomId }: any) => {
      updateMessageReadBy(roomId, messageIds, userId);
    });

    return () => {
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user:online');
      socket.off('message:read');
    };
  }, [token]);

  return socketRef.current;
};

export const getSocket = () => socketInstance;
