'use client';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Props {
  message: any;
  isOwn: boolean;
  showAvatar: boolean;
  currentUserId: string;
}

export default function MessageBubble({ message, isOwn, showAvatar, currentUserId }: Props) {
  const readByOthers = message.readBy?.filter((id: string) => id !== currentUserId);
  const isRead = readByOthers?.length > 0;

  return (
    <div className={clsx('flex items-end gap-2 animate-fade-in', isOwn ? 'flex-row-reverse' : 'flex-row', showAvatar ? 'mt-3' : 'mt-0.5')}>
      {/* Avatar */}
      <div className="w-7 shrink-0">
        {!isOwn && showAvatar && (
          <img
            src={message.sender.avatar}
            alt={message.sender.username}
            className="w-7 h-7 rounded-full object-cover"
            title={message.sender.username}
          />
        )}
      </div>

      {/* Bubble */}
      <div className={clsx('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-500 mb-1 ml-1">{message.sender.username}</span>
        )}
        <div className={isOwn ? 'message-bubble-own' : 'message-bubble-other'}>
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>
        {/* Time + read receipt */}
        <div className={clsx('flex items-center gap-1 mt-0.5', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs text-gray-600">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isOwn && (
            <span
              className={clsx('text-xs', isRead ? 'text-primary-400' : 'text-gray-600')}
              aria-label={isRead ? 'Read' : 'Delivered'}
              title={isRead ? 'Read' : 'Delivered'}
            >
              {isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
