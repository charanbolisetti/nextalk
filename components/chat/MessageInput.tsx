'use client';
import { useState, useRef, useCallback } from 'react';
import { getSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

interface Props { room: any; }

export default function MessageInput({ room }: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);
  const { user } = useAuthStore();
  const { addMessage } = useChatStore();

  const handleTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing:start', { roomId: room._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing:stop', { roomId: room._id });
    }, 2000);
  }, [room._id]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || sending || !user) return;

    const socket = getSocket();
    if (!socket) return;

    setSending(true);
    clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('typing:stop', { roomId: room._id });
    }

    // Optimistic update: add message to store immediately
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      room: room._id,
      sender: { _id: user._id, username: user.username, avatar: user.avatar },
      content: trimmed,
      type: 'text',
      readBy: [user._id],
      createdAt: new Date().toISOString(),
    };
    addMessage(room._id, optimisticMessage);

    socket.emit('message:send', { roomId: room._id, content: trimmed });
    setMessage('');
    setSending(false);
  }, [message, room._id, sending, user, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-dark-600 bg-dark-800">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${room.name}...`}
            rows={1}
            className="w-full bg-dark-700 border border-dark-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-32 overflow-y-auto transition-all"
            style={{ minHeight: '44px' }}
            aria-label={`Message input for ${room.name}`}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="h-11 w-11 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all shrink-0"
          aria-label="Send message"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1.5 ml-1">
        Press <kbd className="px-1 py-0.5 bg-dark-600 rounded text-gray-500 text-xs">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-dark-600 rounded text-gray-500 text-xs">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
