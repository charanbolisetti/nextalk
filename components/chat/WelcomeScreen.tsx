'use client';
import { useAuthStore } from '@/store/authStore';

export default function WelcomeScreen() {
  const { user } = useAuthStore();
  return (
    <div className="flex flex-col items-center justify-center h-full bg-dark-900 text-center px-8">
      <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-primary-600/30">
        <span className="text-3xl font-bold text-white">N</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to NexTalk, {user?.username}!</h2>
      <p className="text-gray-400 max-w-md leading-relaxed">
        Select a room from the sidebar to start chatting, or create a new room to bring your team together.
      </p>
      <div className="grid grid-cols-3 gap-4 mt-10 max-w-sm w-full">
        {[
          { icon: '⚡', label: 'Real-time messaging' },
          { icon: '👥', label: 'Group rooms' },
          { icon: '✓✓', label: 'Read receipts' },
          { icon: '💬', label: 'Typing indicators' },
          { icon: '🟢', label: 'Online presence' },
          { icon: '🔐', label: 'JWT Auth' },
        ].map((f) => (
          <div key={f.label} className="bg-dark-800 rounded-xl p-3 text-center border border-dark-600">
            <div className="text-xl mb-1">{f.icon}</div>
            <p className="text-xs text-gray-400">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
