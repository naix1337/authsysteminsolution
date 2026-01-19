# Frontend - Next.js 14

Modern React-based frontend for the Auth System.

## Features

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Dark Mode Support
- Responsive Design

## Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## Structure

```
src/
├── app/           # App router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   ├── register/
│   ├── forum/
│   └── admin/
├── components/    # Reusable components
└── lib/          # Utilities & API client
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Pages (To Be Implemented)

- `/` - Landing page ✅
- `/login` - Login page
- `/register` - Registration page
- `/forum` - Forum categories
- `/forum/[category]` - Threads list
- `/forum/thread/[id]` - Thread view
- `/profile` - User profile
- `/admin` - Admin dashboard

## Development

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`.

Basic structure is set up. Implement pages as needed according to the implementation plan.
