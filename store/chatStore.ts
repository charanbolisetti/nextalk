import { create } from 'zustand';

interface Message {
  _id: string;
  room: string;
  sender: { _id: string; username: string; avatar: string };
  content: string;
  type: string;
  readBy: string[];
  createdAt: string;
}

interface Room {
  _id: string;
  name: string;
  description: string;
  type: 'group' | 'direct';
  avatar: string;
  members: any[];
  lastMessage?: Message;
  updatedAt: string;
}

interface TypingUser {
  userId: string;
  username: string;
}

interface ChatState {
  rooms: Room[];
  activeRoom: Room | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, TypingUser[]>;
  onlineUsers: Record<string, boolean>;
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (room: Room | null) => void;
  addMessage: (roomId: string, message: Message) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  setTyping: (roomId: string, user: TypingUser, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  updateMessageReadBy: (roomId: string, messageIds: string[], userId: string) => void;
  addRoom: (room: Room) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoom: null,
  messages: {},
  typingUsers: {},
  onlineUsers: {},

  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  addRoom: (room) => set((s) => ({ rooms: [room, ...s.rooms] })),

  addMessage: (roomId, message) =>
    set((s) => {
      const existing = s.messages[roomId] || [];
      // Remove optimistic message with same temp ID if it exists
      const filtered = existing.filter(m => !(m._id === message._id && m._id.startsWith('temp-')));
      // Also remove any optimistic messages with same content sent within 1 second
      const deduped = filtered.filter(m => 
        !(m._id.startsWith('temp-') && m.content === message.content && 
          new Date(m.createdAt).getTime() > new Date(message.createdAt).getTime() - 1000)
      );
      return {
        messages: {
          ...s.messages,
          [roomId]: [...deduped, message],
        },
        rooms: s.rooms.map((r) =>
          r._id === roomId ? { ...r, lastMessage: message, updatedAt: message.createdAt } : r
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      };
    }),

  setMessages: (roomId, messages) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: messages } })),

  setTyping: (roomId, user, isTyping) =>
    set((s) => {
      const current = s.typingUsers[roomId] || [];
      const filtered = current.filter((u) => u.userId !== user.userId);
      return {
        typingUsers: {
          ...s.typingUsers,
          [roomId]: isTyping ? [...filtered, user] : filtered,
        },
      };
    }),

  setUserOnline: (userId, isOnline) =>
    set((s) => ({ onlineUsers: { ...s.onlineUsers, [userId]: isOnline } })),

  updateMessageReadBy: (roomId, messageIds, userId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [roomId]: (s.messages[roomId] || []).map((m) =>
          messageIds.includes(m._id) && !m.readBy.includes(userId)
            ? { ...m, readBy: [...m.readBy, userId] }
            : m
        ),
      },
    })),
}));
