'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/hooks/useSocket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import RoomHeader from './RoomHeader';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow() {
  const { activeRoom, messages, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const roomMessages = activeRoom ? (messages[activeRoom._id] || []) : [];
  const roomTyping = activeRoom ? (typingUsers[activeRoom._id] || []) : [];
  const otherTypers = roomTyping.filter((t) => t.userId !== user?._id);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!hasScrolled || roomMessages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roomMessages.length, activeRoom?._id]);

  // Mark messages as read
  useEffect(() => {
    if (!activeRoom || !user || roomMessages.length === 0) return;
    const socket = getSocket();
    const unread = roomMessages
      .filter((m) => m.sender._id !== user._id && !m.readBy.includes(user._id))
      .map((m) => m._id);
    if (unread.length > 0 && socket) {
      socket.emit('message:read', { messageIds: unread, roomId: activeRoom._id });
    }
  }, [roomMessages, activeRoom, user]);

  if (!activeRoom) return null;

  return (
    <div className="flex flex-col h-full bg-dark-900">
      <RoomHeader room={activeRoom} />

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        onScroll={() => setHasScrolled(true)}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {roomMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">No messages yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to say something!</p>
          </div>
        ) : (
          roomMessages.map((message, i) => {
            const prev = roomMessages[i - 1];
            const showAvatar = !prev || prev.sender._id !== message.sender._id;
            return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === user?._id}
                showAvatar={showAvatar}
                currentUserId={user?._id || ''}
              />
            );
          })
        )}

        {/* Typing indicator */}
        {otherTypers.length > 0 && <TypingIndicator users={otherTypers} />}
        <div ref={bottomRef} />
      </div>

      <MessageInput room={activeRoom} />
    </div>
  );
}
