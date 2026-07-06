# NexTalk 💬

> A production-ready real-time chat platform built with Next.js 14, Socket.io, MongoDB, and Tailwind CSS.

![NexTalk Preview](https://api.dicebear.com/8.x/identicon/svg?seed=nextalk)

## ✨ Features

- 🚀 **Real-time messaging** — bidirectional communication via Socket.io WebSockets
- 🔐 **JWT Authentication** — secure login/register with token-based auth and bcrypt password hashing
- 🟢 **Online/offline presence** — live user status with last-seen timestamps
- ✍️ **Typing indicators** — real-time "X is typing..." with animated dots
- 👥 **Group chat rooms** — create, join, and manage multiple rooms with member management
- ✓✓ **Read receipts** — blue double-ticks when messages are read (WhatsApp-style)
- 📱 **Responsive design** — mobile-first UI built with Tailwind CSS
- ♿ **Accessible** — WCAG 2.1 compliant with ARIA labels, keyboard navigation, and screen reader support

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Real-time | Socket.io (WebSockets) |
| State | Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| DevOps | GitHub Actions CI/CD |

## 🏗 Architecture

```
┌─────────────────────────────────────┐
│          Next.js Frontend           │
│  React + Zustand + Socket.io Client │
└────────────┬────────────────────────┘
             │ HTTP REST + WebSocket
┌────────────▼────────────────────────┐
│       Express.js Backend            │
│  REST API + Socket.io Server        │
└────────────┬────────────────────────┘
             │ Mongoose ODM
┌────────────▼────────────────────────┐
│            MongoDB                  │
│  Users · Rooms · Messages           │
└─────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/charanbolisetti/nextalk.git
cd nextalk

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run development (Next.js + Express server concurrently)
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
nextalk/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login & Register pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main chat dashboard
├── components/
│   ├── chat/               # Chat UI components
│   │   ├── ChatWindow.tsx  # Main chat area
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx  # Typing-aware input
│   │   ├── RoomList.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── CreateRoomModal.tsx
│   └── layout/
│       └── Sidebar.tsx
├── server/                 # Express + Socket.io backend
│   ├── models/             # Mongoose models (User, Room, Message)
│   ├── routes/             # REST API routes
│   ├── socket/             # Socket.io event handlers
│   └── index.js            # Server entry point
├── store/                  # Zustand global state
│   ├── authStore.ts
│   └── chatStore.ts
├── hooks/
│   └── useSocket.ts        # Socket connection hook
└── lib/
    └── api.ts              # Axios instance with auth interceptor
```

## ⚡ Key Technical Decisions

### Socket.io over WebSocket API
Used Socket.io for built-in reconnection, room management, and fallback transport — critical for production reliability.

### Zustand over Redux
Chosen for minimal boilerplate and direct state updates without action/reducer overhead — ideal for real-time state that changes frequently.

### BFF-ready Architecture
API routes in Next.js can be extended as a Backend-for-Frontend layer, keeping sensitive logic server-side.

### Optimistic UI
Message state updates immediately on send before server confirmation — provides instant feedback and a native app feel.

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with 7-day expiry
- Socket connections authenticated via JWT middleware
- No client-side token exposure (headers only)
- Input validation and sanitization on all routes

## 📈 Performance

- MongoDB indexes on `Message.room + createdAt` for fast pagination
- Zustand store prevents unnecessary re-renders
- Messages paginated (30 per page) with infinite scroll ready
- Socket events scoped to rooms — no global broadcasts

## 🚢 Deployment

```bash
# Build Next.js
npm run build

# Start production
npm start           # Next.js
node server/index.js # Express server
```

Recommended: Deploy Next.js on **Vercel**, Express server on **Railway** or **Render**, MongoDB on **Atlas**.

## 📄 License

MIT © Durga Charan Naidu Bolisetti
