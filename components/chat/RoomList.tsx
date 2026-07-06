'use client';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import clsx from 'clsx';

interface Props { searchQuery: string; }

export default function RoomList({ searchQuery }: Props) {
  const { rooms, activeRoom, setActiveRoom, setMessages } = useChatStore();
  const { user } = useAuthStore();

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRoom = async (room: any) => {
    setActiveRoom(room);
    try {
      const { data } = await api.get(`/rooms/${room._id}/messages`);
      setMessages(room._id, data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
        <p className="text-gray-500 text-sm">No rooms found</p>
        <p className="text-gray-600 text-xs mt-1">Create one to get started</p>
      </div>
    );
  }

  return (
    <div className="py-1">
      <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Rooms ({filtered.length})
      </p>
      {filtered.map((room) => {
        const isActive = activeRoom?._id === room._id;
        const onlineCount = room.members?.filter((m: any) => m.isOnline).length || 0;

        return (
          <button
            key={room._id}
            onClick={() => handleSelectRoom(room)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors text-left',
              isActive && 'bg-dark-700 border-r-2 border-primary-500'
            )}
            aria-label={`Open room ${room.name}`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={room.avatar}
                alt={room.name}
                className="w-10 h-10 rounded-xl object-cover bg-dark-600"
              />
              {onlineCount > 0 && (
                <span className="absolute -bottom-0.5 -right-0.5 online-dot" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={clsx('text-sm font-medium truncate', isActive ? 'text-white' : 'text-gray-200')}>
                  {room.name}
                </span>
                {room.lastMessage && (
                  <span className="text-xs text-gray-500 shrink-0 ml-1">
                    {formatDistanceToNow(new Date(room.updatedAt), { addSuffix: false })}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {room.lastMessage
                  ? `${room.lastMessage.sender?.username}: ${room.lastMessage.content}`
                  : `${room.members?.length || 0} members · ${onlineCount} online`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
