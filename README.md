# Smart Do Journey 🚀

A modern, gamified todo application built with React, TypeScript, and Supabase. Transform your daily tasks into an engaging journey with XP, levels, streaks, and beautiful animations.

## ✨ Features

### 🎯 Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks with categories and priorities
- **Smart Categories**: Personal, work, shopping, and custom categories
- **Priority System**: High, medium, and low priority levels
- **Date & Time**: Set start/end dates, times, and reminders
- **Voice Input**: Speech-to-text task creation
- **AI Suggestions**: Intelligent priority suggestions for tasks

### 🎮 Gamification
- **XP System**: Earn experience points for completing tasks
- **Level Progression**: Level up as you complete more tasks
- **Streak Tracking**: Maintain daily task completion streaks
- **Badges & Achievements**: Unlock badges for milestones
- **Confetti Celebrations**: Visual rewards for task completion

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Animated Backgrounds**: Beautiful visual effects
- **Blast Effects**: Satisfying animations for task completion
- **Responsive Sidebar**: Easy navigation and task filtering

### 🔐 Authentication & Data
- **Supabase Integration**: Secure user authentication and data storage
- **Guest Mode**: Try the app without signing up
- **Data Sync**: Tasks sync across devices for authenticated users
- **Local Storage**: Offline support for guest users

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Server state management

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations

### Backend & Database
- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Reliable database
- **Row Level Security** - Secure data access

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing
- **TypeScript ESLint** - TypeScript-specific linting

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd smart-do-journey1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```


## 📱 Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run build:dev`** - Build for development
- **`npm run preview`** - Preview production build
- **`npm run lint`** - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── TodoApp.tsx     # Main todo application
│   ├── AuthButtons.tsx # Authentication components
│   └── ...             # Other components
├── contexts/            # React contexts
│   └── AuthContext.tsx # Authentication state
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/       # Supabase client and functions
├── lib/                 # Utility functions
├── pages/               # Application pages
├── types/               # TypeScript type definitions
└── main.tsx            # Application entry point
```

## 🔧 Configuration

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Add them to your `.env.local` file
4. Set up the database schema (see `supabase/` directory)

### Tailwind CSS
The project uses Tailwind CSS with custom configuration. See `tailwind.config.ts` for theme customization.

## 🎨 Customization

### Themes
- Modify `src/components/ThemeSwitcher.tsx` for custom themes
- Update `tailwind.config.ts` for color schemes

### Components
- All UI components are in `src/components/ui/`
- Based on shadcn/ui for easy customization
- Use Radix UI primitives for accessibility

### Styling
- Tailwind CSS classes for styling
- CSS variables for theme colors
- Custom animations in `src/components/AnimatedBackground.tsx`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

### Supabase Functions
The project includes Supabase Edge Functions for AI priority suggestions:
```bash
supabase functions deploy ai-priority-suggestion
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Supabase** for backend services
- **Tailwind CSS** for styling utilities
- **React community** for amazing libraries


---

**Happy tasking! 🎉**
