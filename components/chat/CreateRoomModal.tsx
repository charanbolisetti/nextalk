'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useChatStore } from '@/store/chatStore';

interface Props { onClose: () => void; }

export default function CreateRoomModal({ onClose }: Props) {
  const { addRoom } = useChatStore();
  const [form, setForm] = useState({ name: '', description: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data)).catch(console.error);
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Room name is required');
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', { ...form, memberIds: selected });
      addRoom(data);
      toast.success(`Room "${data.name}" created!`);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Create room">
      <div className="bg-dark-800 rounded-2xl w-full max-w-md border border-dark-600 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600">
          <h3 className="text-white font-semibold text-lg">Create Room</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="Close modal">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Room Name *</label>
            <input type="text" className="input-field" placeholder="e.g. team-frontend"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              required aria-label="Room name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <input type="text" className="input-field" placeholder="Optional description"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              aria-label="Room description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Members {selected.length > 0 && <span className="text-primary-400">({selected.length} selected)</span>}
            </label>
            <input type="search" className="input-field mb-2" placeholder="Search users..."
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
            <div className="max-h-36 overflow-y-auto space-y-1">
              {filtered.map((u) => (
                <button key={u._id} type="button" onClick={() => toggleUser(u._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${selected.includes(u._id) ? 'bg-primary-600/20 border border-primary-600/30' : 'hover:bg-dark-700'}`}>
                  <div className="relative">
                    <img src={u.avatar} alt={u.username} className="w-7 h-7 rounded-full" />
                    {u.isOnline && <span className="absolute -bottom-0.5 -right-0.5 online-dot scale-75" />}
                  </div>
                  <span className="text-sm text-gray-200">{u.username}</span>
                  {selected.includes(u._id) && <span className="ml-auto text-primary-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
