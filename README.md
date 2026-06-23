# 🚀 SmartDo Journey — Gamified Task Manager

Turn your daily tasks into an engaging adventure. SmartDo Journey is a modern, gamified to-do app with XP, levels, streaks, badges, analytics, and satisfying animations — all wrapped in a sleek dark UI.

![Dark Theme](https://img.shields.io/badge/theme-dark-1a1a2e?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## ✨ Features

### 🎯 Task Management
- Create, edit, delete, and organise tasks with categories & priorities
- Quick-add with minimal friction — type and press Enter
- Smart categories: Personal, Work, Shopping, Other
- Priority levels: High, Medium, Low
- Date, time, and reminder support
- Voice input — speak your tasks into existence

### 🎮 Gamification Engine
- **XP System** — earn experience points for every completed task
- **Level Progression** — level up and unlock new milestones
- **Daily Streaks** — maintain your productivity streak
- **Badges & Achievements** — unlock 12+ badges (First Task, Streak Master, Centurion, and more)
- **Confetti & Blast Effects** — satisfying visual celebrations on task completion

### 📊 Analytics Dashboard
- Area charts for task completion trends
- Bar charts for weekly productivity breakdown
- Pie charts for category distribution
- Real-time stats: tasks today, pending, completion rate

### 🌙 Dark Theme
- Exclusive dark UI designed for focus and reduced eye strain
- Carefully curated colour palette optimised for readability
- Smooth animations and micro-interactions throughout

### 🔐 Authentication & Data
- **Supabase Auth** — secure email/password authentication
- **Guest Mode** — try the app instantly without signing up
- **Cloud Sync** — tasks sync across devices for logged-in users
- **Local Storage** — offline support for guest users

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, React Router |
| **State** | React Query (TanStack Query), React Context |
| **UI** | Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons |
| **Charts** | Recharts |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions) |
| **Tooling** | ESLint, PostCSS, TypeScript ESLint |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Ganesh030106/smart-to-do-journey.git
cd smart-to-do-journey

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory:
cp .env.example .env   # then edit with your keys
```

Add the following to your `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`.

---

## 📁 Project Structure

```
src/
├── components/           # UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── TodoApp.tsx      # Main app (tasks, analytics, badges)
│   ├── AuthButtons.tsx  # Login/Signup buttons
│   ├── BlastEffect.tsx  # Task completion animation
│   ├── AnimatedBackground.tsx
│   └── ...
├── contexts/
│   └── AuthContext.tsx   # Auth state management
├── hooks/                # Custom React hooks
├── integrations/
│   └── supabase/        # Supabase client, queries, types
├── pages/
│   ├── Welcome.tsx      # Landing page
│   ├── Index.tsx        # Dashboard route
│   └── NotFound.tsx     # 404 page
├── types/
│   └── task.ts          # Task type definitions
├── index.css            # Design system & animations
└── main.tsx             # App entry point
```

---

## 📱 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🔧 Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **Anon Key**
3. Add them to `.env`
4. Run the migration in `supabase/migrations/` to create the tasks table
5. (Optional) Deploy the AI priority suggestion Edge Function:
   ```bash
   supabase functions deploy ai-priority-suggestion
   ```

---

## 🚀 Deployment

### Vercel / Netlify
1. Connect your GitHub repository
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
3. Build command: `npm run build`
4. Output directory: `dist`

A `public/_redirects` file is included for Netlify SPA routing.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) — Beautiful, accessible components
- [Supabase](https://supabase.com/) — Open-source backend
- [Recharts](https://recharts.org/) — Composable chart library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Lucide](https://lucide.dev/) — Beautiful open-source icons

---

