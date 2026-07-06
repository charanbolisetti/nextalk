'use client';
interface Props { users: { userId: string; username: string }[]; }

export default function TypingIndicator({ users }: Props) {
  const names = users.map((u) => u.username).join(', ');
  const label = users.length === 1 ? `${names} is typing...` : `${names} are typing...`;

  return (
    <div className="flex items-center gap-2 px-2 animate-fade-in" aria-live="polite" aria-label={label}>
      <div className="flex gap-1 bg-dark-600 rounded-2xl rounded-bl-sm px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
