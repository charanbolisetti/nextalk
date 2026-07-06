import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexTalk — Real-time Chat',
  description: 'Modern real-time chat platform built with Next.js and Socket.io',
  keywords: ['chat', 'real-time', 'messaging', 'nextjs', 'socket.io'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#252636', color: '#fff', border: '1px solid #2e2f45' },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
