'use client';
interface Props { room: any; }

export default function RoomHeader({ room }: Props) {
  const onlineCount = room.members?.filter((m: any) => m.isOnline).length || 0;

  return (
    <header className="flex items-center gap-3 px-5 py-3.5 border-b border-dark-600 bg-dark-800 shrink-0">
      <img src={room.avatar} alt={room.name} className="w-9 h-9 rounded-xl object-cover bg-dark-600" />
      <div className="flex-1 min-w-0">
        <h2 className="text-white font-semibold text-sm truncate"># {room.name}</h2>
        <p className="text-xs text-gray-500">
          {room.members?.length || 0} members
          {onlineCount > 0 && <span className="text-green-400 ml-1.5">· {onlineCount} online</span>}
        </p>
      </div>
      {room.description && (
        <p className="hidden md:block text-xs text-gray-500 max-w-xs truncate border-l border-dark-600 pl-4">
          {room.description}
        </p>
      )}
    </header>
  );
}
