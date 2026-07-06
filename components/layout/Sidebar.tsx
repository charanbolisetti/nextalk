'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import RoomList from '@/components/chat/RoomList';
import CreateRoomModal from '@/components/chat/CreateRoomModal';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <aside className="w-72 flex flex-col bg-dark-800 border-r border-dark-600 h-full shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-dark-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-white font-semibold text-lg">NexTalk</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-8 h-8 bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center justify-center transition-colors"
          aria-label="Create new room"
          title="Create room"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search rooms..."
            className="w-full bg-dark-700 text-white placeholder-gray-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border border-dark-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search rooms"
          />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        <RoomList searchQuery={search} />
      </div>

      {/* User footer */}
      <div className="px-4 py-3 border-t border-dark-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user?.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.username}`}
              alt={user?.username}
              className="w-9 h-9 rounded-full object-cover bg-dark-600"
            />
            <span className="absolute -bottom-0.5 -right-0.5 online-dot" aria-label="Online" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-green-400">Online</p>
          </div>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            aria-label="Sign out"
            title="Sign out"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </aside>
  );
}
