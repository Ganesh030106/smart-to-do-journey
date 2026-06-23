import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, MicOff, Plus, Star, Trophy, Flame, Brain, Share2, 
  Calendar as CalendarIcon, Clock, ListTodo, User,
  CheckSquare, BarChart2, Award, ChevronUp, ChevronDown, Search, Sparkles
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthButtons from "@/components/AuthButtons";
import SettingsMenu, { type AppSettings } from "@/components/SettingsMenu";
import AnimatedBackground from "@/components/AnimatedBackground";
import ProfileModal from "@/components/ProfileModal";
import ResponsiveSidebar from "@/components/ResponsiveSidebar";
import BlastEffect from "@/components/BlastEffect";
import TaskEditDialog from "@/components/TaskEditDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Task } from "@/types/task";
import { fetchTasksForUser, insertTaskForUser, updateTaskForUser, deleteTaskForUser } from "@/integrations/supabase/tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { ChartTooltip } from "@/components/ui/chart";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_task",
    name: "First Step",
    description: "Completed your first task!",
    icon: "🎯",
    color: "from-emerald-500/10 via-green-500/5 to-transparent border-emerald-400/50 text-emerald-500",
    requirement: "Complete 1 task"
  },
  {
    id: "streak_3",
    name: "Consistent",
    description: "Maintained a 3-day completion streak!",
    icon: "🔥",
    color: "from-orange-500/10 via-red-500/5 to-transparent border-orange-400/50 text-orange-500",
    requirement: "3-day streak"
  },
  {
    id: "streak_7",
    name: "Unstoppable",
    description: "Maintained a 7-day task streak!",
    icon: "⚡",
    color: "from-amber-500/10 via-yellow-500/5 to-transparent border-amber-400/50 text-amber-500",
    requirement: "7-day streak"
  },
  {
    id: "level_5",
    name: "Elite Achiever",
    description: "Reached level 5!",
    icon: "👑",
    color: "from-purple-500/10 via-pink-500/5 to-transparent border-purple-400/50 text-purple-500",
    requirement: "Reach level 5"
  },
  {
    id: "high_priority_5",
    name: "Crisis Solver",
    description: "Completed 5 high-priority tasks!",
    icon: "🎯",
    color: "from-rose-500/10 via-red-500/5 to-transparent border-rose-400/50 text-rose-500",
    requirement: "Complete 5 high priority tasks"
  },
  {
    id: "completed_10",
    name: "Task Master",
    description: "Completed 10 tasks in total!",
    icon: "🏆",
    color: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-400/50 text-emerald-500",
    requirement: "Complete 10 tasks"
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Completed a task between 5 AM and 9 AM!",
    icon: "🌅",
    color: "from-teal-500/10 via-sky-500/5 to-transparent border-teal-400/50 text-teal-500",
    requirement: "Complete a task before 9 AM"
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Completed a task between 9 PM and 4 AM!",
    icon: "🌃",
    color: "from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-400/50 text-indigo-500",
    requirement: "Complete a task after 9 PM"
  }
];


interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastTaskDate: string;
  badges: string[];
}

const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('personal');
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    streak: 0,
    lastTaskDate: '',
    badges: []
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'ongoing' | 'finished'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [customCategories, setCustomCategories] = useState<string[]>(['work', 'personal', 'shopping', 'other']);
  const [newCategory, setNewCategory] = useState('');
  const [reminderTime, setReminderTime] = useState<string>('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [blastByTask, setBlastByTask] = useState<Record<string, { key: number; variant: 'success' | 'danger' }>>({});
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({ enableConfetti: true });
  const recognitionRef = useRef<any>(null);

  // Background Cloud Sync Recovery handler
  const syncTasksToCloud = async (currentTasks: Task[]) => {
    if (!user || isGuest) return;
    try {
      toast({
        title: "Syncing... ☁️",
        description: "Backing up your task list to Supabase."
      });
      // Try to upsert tasks to supabase
      for (const t of currentTasks) {
        await insertTaskForUser(user.id, t).catch(async () => {
          await updateTaskForUser(user.id, t);
        });
      }
      toast({
        title: "Synced Successfully! ☁️",
        description: "All changes are backed up to Supabase."
      });
    } catch (err) {
      console.error("Cloud sync retry failed:", err);
      toast({
        title: "Sync failed ⚠️",
        description: "Could not connect to database. Tasks remain saved on this device.",
        action: (
          <Button variant="outline" size="sm" onClick={() => syncTasksToCloud(currentTasks)}>
            Retry Sync
          </Button>
        )
      });
    }
  };

  // Load tasks from Supabase for authenticated users; otherwise from localStorage.
  useEffect(() => {
    const load = async () => {
      try {
        if (user && !isGuest) {
          const remoteTasks = await fetchTasksForUser(user.id);
          setTasks(remoteTasks);
        } else {
          const savedTasks = localStorage.getItem('gamified-tasks');
          if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
              startDate: task.startDate ? new Date(task.startDate) : undefined,
              endDate: task.endDate ? new Date(task.endDate) : undefined,
              startTime: task.startTime ?? undefined,
              endTime: task.endTime ?? undefined,
              reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
            }));
            setTasks(parsedTasks);
          } else {
            setTasks([]);
          }
        }
      } catch (e) {
        console.error('Failed to load tasks:', e);
      }

      // Load stats and categories from localStorage in all modes (unchanged behavior)
      const savedStats = localStorage.getItem('gamified-stats');
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }
      const savedCategories = localStorage.getItem('gamified-categories');
      if (savedCategories) {
        setCustomCategories(JSON.parse(savedCategories));
      }

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    };
    load();
  }, [user, isGuest]);

  // Save to localStorage whenever tasks or stats change
  useEffect(() => {
    if (!user || isGuest) {
      localStorage.setItem('gamified-tasks', JSON.stringify(tasks));
    }
  }, [tasks, user, isGuest]);

  // Debug deletingTaskId changes
  useEffect(() => {
    console.log('deletingTaskId changed to:', deletingTaskId);
  }, [deletingTaskId]);

  useEffect(() => {
    localStorage.setItem('gamified-stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('gamified-categories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Notification reminder system
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.reminderTime && !task.completed && task.reminderTime <= now) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Task Reminder: ${task.text}`, {
              body: `Priority: ${task.priority} | Category: ${task.category}`,
              icon: '/favicon.ico'
            });
          }
          toast({
            title: "Task Reminder! ⏰",
            description: task.text
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, toast]);

  // Reminder system moved to next line

  // XP calculation based on priority
  const getXPForTask = (priority: Task['priority']) => {
    const xpMap = { high: 30, medium: 20, low: 10 };
    return xpMap[priority];
  };

  // Level calculation
  const getRequiredXPForLevel = (level: number) => level * 100;

  // Add task function
  // Add task function
  const addTask = async (taskText: string) => {
    if (!taskText.trim()) return;

    const newTaskObj: Task = {
      id: crypto.randomUUID(),
      text: taskText.trim(),
      description: newTaskDescription.trim() || undefined,
      completed: false,
      category: selectedCategory,
      priority: selectedPriority,
      createdAt: new Date(),
      startDate,
      endDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      reminderTime: reminderTime ? new Date(reminderTime) : undefined,
    };

    const nextTasks = [newTaskObj, ...tasks];
    setTasks(nextTasks);
    
    // Save to localStorage instantly
    if (!user || isGuest) {
      localStorage.setItem('gamified-tasks', JSON.stringify(nextTasks));
    }

    setNewTask('');
    setNewTaskDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("");
    setEndTime("");
    setReminderTime("");
    
    toast({
      title: "Task Added! 📝",
      description: `"${taskText}" added to your list`
    });

    if (user && !isGuest) {
      try {
        await insertTaskForUser(user.id, newTaskObj);
      } catch (err) {
        console.error('Background task insert failed:', err);
        toast({
          title: "Sync Pending ☁️",
          description: "Saved locally. Connection to Supabase failed.",
          action: (
            <Button variant="outline" size="sm" onClick={() => syncTasksToCloud(nextTasks)}>
              Retry Sync
            </Button>
          )
        });
      }
    }
  };

  // Add new category
  const addCategory = () => {
    if (!newCategory.trim() || customCategories.includes(newCategory.trim().toLowerCase())) return;
    
    setCustomCategories(prev => [...prev, newCategory.trim().toLowerCase()]);
    setNewCategory('');
    toast({
      title: "Category Added! 🏷️",
      description: `"${newCategory}" category created`
    });
  };

  // Edit task
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setShowEditDialog(true);
  };

  const saveEditedTask = async (updatedTask: Task) => {
    const nextTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(nextTasks);

    if (!user || isGuest) {
      localStorage.setItem('gamified-tasks', JSON.stringify(nextTasks));
    }

    toast({
      title: "Task Updated! ✏️",
      description: "Your task has been updated successfully"
    });

    if (user && !isGuest) {
      try {
        await updateTaskForUser(user.id, updatedTask);
      } catch (err) {
        console.error('Background task update failed:', err);
        toast({
          title: "Sync Pending ☁️",
          description: "Update saved locally. Sync failed.",
          action: (
            <Button variant="outline" size="sm" onClick={() => syncTasksToCloud(nextTasks)}>
              Retry Sync
            </Button>
          )
        });
      }
    }
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    console.log('Delete task called with ID:', taskId);
    setDeletingTaskId(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    
    const task = tasks.find(t => t.id === deletingTaskId);
    if (!task) return;

    const nextTasks = tasks.filter(t => t.id !== deletingTaskId);
    setTasks(nextTasks);

    if (!user || isGuest) {
      localStorage.setItem('gamified-tasks', JSON.stringify(nextTasks));
    }
    
    if (task.completed) {
      setUserStats(prev => ({
        ...prev,
        xp: Math.max(0, prev.xp - getXPForTask(task.priority))
      }));
    }

    setDeletingTaskId(null);
    toast({
      title: "Task Deleted! 🗑️",
      description: "Task has been removed from your list"
    });

    if (user && !isGuest) {
      try {
        await deleteTaskForUser(user.id, deletingTaskId);
      } catch (err) {
        console.error('Background task delete failed:', err);
        toast({
          title: "Sync Pending ☁️",
          description: "Deletion saved locally. Sync failed.",
          action: (
            <Button variant="outline" size="sm" onClick={() => syncTasksToCloud(nextTasks)}>
              Retry Sync
            </Button>
          )
        });
      }
    }
  };

  // Share task list function
  const shareTaskList = () => {
    const currentFilters = {
      taskFilter,
      categoryFilter,
      priorityFilter,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    };
    
    const shareData = {
      tasks: filteredTasks,
      filters: currentFilters,
      userStats,
      timestamp: new Date().toISOString()
    };
    
    // Create a shareable link (you can implement this with your own sharing service)
    const shareUrl = `${window.location.origin}/shared?data=${encodeURIComponent(JSON.stringify(shareData))}`;
    setShareLink(shareUrl);
    setShowShareDialog(true);
    
    // Also try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'My Task List',
        text: `Check out my task list with ${filteredTasks.length} tasks!`,
        url: shareUrl
      }).catch(console.error);
    }
  };

  // Complete task with gamification
  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    const xpGained = getXPForTask(task.priority);
    const currentDate = new Date().toDateString();
    
    const updatedTask: Task = { ...task, completed: true, completedAt: new Date() };
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? updatedTask
        : t
    ));

    if (user && !isGuest) {
      updateTaskForUser(user.id, updatedTask).catch((e) => {
        console.error('Failed to mark task complete:', e);
      });
    }

    setUserStats(prev => {
      const newXP = prev.xp + xpGained;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > prev.level;
      
      // Check streak
      const lastDate = new Date(prev.lastTaskDate);
      const today = new Date(currentDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = prev.streak;
      if (prev.lastTaskDate === currentDate) {
        // Same day, no change
      } else if (prev.lastTaskDate === yesterday.toDateString() || prev.streak === 0) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1; // Reset streak
      }

      // Badge feature removed

      if (leveledUp) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        toast({
          title: "🎉 Level Up!",
          description: `You reached Level ${newLevel}!`
        });
      }

      toast({
        title: "Task Completed! ✅",
        description: `+${xpGained} XP gained!`
      });

      return {
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        lastTaskDate: currentDate,
        badges: prev.badges
      };
    });
  };

  // Add uncompleteTask function
  const uncompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.completed) return;

    const xpLost = getXPForTask(task.priority);
    const updatedTask: Task = { ...task, completed: false, completedAt: undefined };
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    if (user && !isGuest) {
      updateTaskForUser(user.id, updatedTask).catch((e) => {
        console.error('Failed to mark task incomplete:', e);
      });
    }

    setUserStats(prev => {
      const newXP = Math.max(0, prev.xp - xpLost);
      const newLevel = Math.floor(newXP / 100) + 1;
      // Streak logic: do not change streak or lastTaskDate on uncheck
      toast({
        title: "Task Unchecked!",
        description: `-${xpLost} XP removed!`
      });
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  // Voice input setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewTask(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice input failed",
          description: "Please try again or type your task"
        });
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input"
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: "🎤 Listening...",
        description: "Speak your task now"
      });
    }
  };

  // AI Suggestions based on time
  const getAISuggestions = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return [
        "Review your goals for today",
        "Plan your morning routine",
        "Check important emails"
      ];
    } else if (hour < 17) {
      return [
        "Take a 15-minute break",
        "Follow up on pending tasks",
        "Prepare for tomorrow"
      ];
    } else {
      return [
        "Reflect on today's achievements",
        "Plan tomorrow's priorities", 
        "Wind down with a good book"
      ];
    }
  };

  const currentXPProgress = ((userStats.xp % 100) / 100) * 100;
  // Filter tasks based on all filters
  const filteredTasks = tasks.filter(task => {
    const statusMatch = taskFilter === 'all' ? true : 
                       taskFilter === 'ongoing' ? !task.completed : task.completed;
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    const searchMatch = !searchQuery.trim() || 
                        task.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    return statusMatch && categoryMatch && priorityMatch && searchMatch;
  });

  const allCount = tasks.length;
  const ongoingCount = tasks.filter(t => !t.completed).length;
  const finishedCount = tasks.filter(t => t.completed).length;

  // Helper calculations for achievements
  const completedTasksList = tasks.filter(t => t.completed);
  const completedCount = completedTasksList.length;
  const highPriorityCount = completedTasksList.filter(t => t.priority === 'high').length;
  const earlyBirdCount = completedTasksList.filter(t => {
    if (!t.completedAt) return false;
    const h = new Date(t.completedAt).getHours();
    return h >= 5 && h < 9;
  }).length;
  const nightOwlCount = completedTasksList.filter(t => {
    if (!t.completedAt) return false;
    const h = new Date(t.completedAt).getHours();
    return h >= 21 || h < 4;
  }).length;

  const getBadgeProgress = (badgeId: string) => {
    switch (badgeId) {
      case 'first_task':
        return { current: Math.min(completedCount, 1), target: 1 };
      case 'streak_3':
        return { current: Math.min(userStats.streak, 3), target: 3 };
      case 'streak_7':
        return { current: Math.min(userStats.streak, 7), target: 7 };
      case 'level_5':
        return { current: Math.min(userStats.level, 5), target: 5 };
      case 'high_priority_5':
        return { current: Math.min(highPriorityCount, 5), target: 5 };
      case 'completed_10':
        return { current: Math.min(completedCount, 10), target: 10 };
      case 'early_bird':
        return { current: Math.min(earlyBirdCount, 1), target: 1 };
      case 'night_owl':
        return { current: Math.min(nightOwlCount, 1), target: 1 };
      default:
        return { current: 0, target: 1 };
    }
  };

  // 7-day productivity trend
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const count = tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === dateStr).length;
    return {
      name: d.toLocaleDateString([], { weekday: 'short' }),
      completed: count,
    };
  });

  const categoryColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

  // Completed tasks by category
  const categoryData = Array.from(new Set(tasks.map(t => t.category))).map(cat => {
    const count = tasks.filter(t => t.completed && t.category === cat).length;
    return { name: cat, value: count };
  }).filter(item => item.value > 0);

  const priorityData = (['high', 'medium', 'low'] as const).map(prio => {
    const completed = tasks.filter(t => t.completed && t.priority === prio).length;
    const ongoing = tasks.filter(t => !t.completed && t.priority === prio).length;
    return {
      name: prio.charAt(0).toUpperCase() + prio.slice(1),
      Completed: completed,
      Ongoing: ongoing,
    };
  });

  return (
    <div className="min-h-screen bg-background p-0 md:p-4 relative overflow-hidden animated-gradient">
      {/* Background decoration */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      {/* Confetti effect */}
      {settings.enableConfetti && showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti absolute w-2 h-2 bg-primary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`
              }}
            />
          ))}
        </div>
      )}

      <ResponsiveSidebar>
      <div className="max-w-4xl mx-auto relative z-10 px-3 md:px-0">
        {/* Background */}
        <AnimatedBackground />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <span className="font-semibold">Your Tasks</span>
            {isGuest && (
              <Badge variant="secondary" className="ml-2">
                <User className="h-3 w-3 mr-1" />
                Guest Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SettingsMenu onChange={setSettings} />
            <AuthButtons />

          </div>
        </div>

        {/* Header with stats */}
        <div className="text-center mb-8 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/favicon.ico" alt="SmartDo Journey" className="h-10 w-10" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gamified To-Do List
            </h1>
          </div>
          <p className="text-muted-foreground">Turn your Productivity Time into an Adventure!</p>
          {isGuest && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                🎯 You're in Guest Mode. Your tasks will be saved locally. 
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-primary ml-1"
                  onClick={() => window.location.href = '/'}
                >
                  Sign up to sync across devices
                </Button>
              </p>
            </div>
          )}
        </div>

        {/* User Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-xp-bar" />
                Level {userStats.level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={currentXPProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {userStats.xp % 100}/{getRequiredXPForLevel(userStats.level)} XP
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{userStats.xp}</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-destructive streak-fire" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{userStats.streak} days</p>
            </CardContent>
          </Card>

          {/* Badges removed */}
        </div>

        {/* Tabs Dashboard Layout */}
        <Tabs defaultValue="tasks" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6 bg-card border border-muted-foreground/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
            <TabsTrigger value="tasks" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary">
              <CheckSquare className="h-4 w-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary">
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary">
              <Award className="h-4 w-4" />
              <span>Badges</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none">
            {/* Quick-Add & Advanced Options Task Section */}
            <Card className="bg-card/80 backdrop-blur-sm shadow-sm border border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-primary" />
                  New Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="What needs to be done? (Quick-add)"
                    onKeyPress={(e) => e.key === 'Enter' && addTask(newTask)}
                    className="flex-1 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="New task name"
                  />
                  <Button
                    onClick={toggleVoiceInput}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    className={isRecording ? "voice-recording h-10 w-10" : "h-10 w-10"}
                    aria-label="Voice input toggle"
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button onClick={() => addTask(newTask)} className="px-6 h-10 font-semibold" aria-label="Add task button">
                    Add
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add description... (optional)"
                    className="flex-1 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="New task description"
                  />
                </div>

                <div className="border-t border-muted-foreground/15 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium h-8"
                    aria-label="Toggle advanced task settings"
                  >
                    <span>{showAdvancedOptions ? "Hide Options" : "Advanced Options"}</span>
                    {showAdvancedOptions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>

                {showAdvancedOptions && (
                  <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                    <div className="flex gap-2 flex-wrap items-center">
                      <span className="text-xs font-semibold text-muted-foreground uppercase mr-2">Category:</span>
                      {customCategories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="capitalize h-8 text-xs font-medium"
                          aria-label={`Select category ${category}`}
                        >
                          {category}
                        </Button>
                      ))}
                      
                      <div className="flex gap-1 items-center ml-2">
                        <Input 
                          placeholder="New category" 
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                          className="w-28 h-8 text-xs focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label="Custom category input"
                        />
                        <Button onClick={addCategory} size="sm" variant="outline" className="h-8 text-xs" aria-label="Add custom category">
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap items-center border-t border-muted/30 pt-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase mr-2">Priority:</span>
                      {(['high', 'medium', 'low'] as const).map(priority => (
                        <Button
                          key={priority}
                          variant={selectedPriority === priority ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPriority(priority)}
                          className="capitalize h-8 text-xs font-medium"
                          aria-label={`Set priority ${priority}`}
                        >
                          {priority} (+{getXPForTask(priority)} XP)
                        </Button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-muted/30 pt-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Start Date & Time</Label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 text-xs" aria-label="Start date selector">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {startDate ? startDate.toLocaleDateString() : 'Start date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="p-0">
                              <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                            </PopoverContent>
                          </Popover>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-28 h-9 text-xs focus-visible:ring-2 focus-visible:ring-primary" aria-label="Start time input" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">End Date & Time</Label>
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 text-xs" aria-label="End date selector">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {endDate ? endDate.toLocaleDateString() : 'End date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="p-0">
                              <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                            </PopoverContent>
                          </Popover>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-28 h-9 text-xs focus-visible:ring-2 focus-visible:ring-primary" aria-label="End time input" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-muted/30 pt-3">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase">Alert Reminder</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="datetime-local" 
                          value={reminderTime} 
                          onChange={(e) => setReminderTime(e.target.value)} 
                          className="w-44 h-9 text-xs focus-visible:ring-2 focus-visible:ring-primary" 
                          aria-label="Reminder alert datetime input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions Collapsible */}
            <Card className="bg-card/85 backdrop-blur-sm border border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base font-semibold">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAISuggestions(!showAISuggestions)}
                    aria-label="Toggle AI suggestions"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    {showAISuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showAISuggestions && (
                <CardContent className="animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {getAISuggestions().map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 bg-muted/50 hover:bg-muted border border-muted hover:border-primary/20 rounded-lg cursor-pointer transition-colors text-center"
                        onClick={() => setNewTask(suggestion)}
                        aria-label={`Apply AI suggestion: ${suggestion}`}
                      >
                        <p className="text-xs font-medium text-foreground">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Tasks List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <h2 className="text-xl font-bold title-glow">Your Tasks</h2>
                <div className="flex gap-2 items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 h-9 text-xs"
                    onClick={shareTaskList}
                    aria-label="Share task list link"
                  >
                    <Share2 className="h-4 w-4" />
                    Share List
                  </Button>
                </div>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tasks by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full bg-card/60 backdrop-blur-sm border border-muted focus-visible:ring-2 focus-visible:ring-primary h-10 text-sm"
                  aria-label="Search tasks"
                />
              </div>
              
              {/* Filter Controls Panel */}
              <div className="flex flex-wrap gap-4 items-center bg-card/40 backdrop-blur-sm p-3 border border-muted rounded-lg">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
                  <Button
                    variant={taskFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskFilter('all')}
                    className="h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Filter status all"
                  >
                    All ({allCount})
                  </Button>
                  <Button
                    variant={taskFilter === 'ongoing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskFilter('ongoing')}
                    className="h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Filter status ongoing"
                  >
                    Ongoing ({ongoingCount})
                  </Button>
                  <Button
                    variant={taskFilter === 'finished' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskFilter('finished')}
                    className="h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Filter status finished"
                  >
                    Finished ({finishedCount})
                  </Button>
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category:</span>
                  <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                    className="h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Filter category all"
                  >
                    All
                  </Button>
                  {customCategories.map(category => (
                    <Button
                      key={category}
                      variant={categoryFilter === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(category)}
                      className="capitalize h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Filter category ${category}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Priority:</span>
                  <Button
                    variant={priorityFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPriorityFilter('all')}
                    className="h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Filter priority all"
                  >
                    All
                  </Button>
                  {(['high', 'medium', 'low'] as const).map(priority => (
                    <Button
                      key={priority}
                      variant={priorityFilter === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriorityFilter(priority)}
                      className="capitalize h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Filter priority ${priority}`}
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <Card className="bg-card/80 backdrop-blur-sm border border-muted">
                  <CardContent className="p-8 text-center text-muted-foreground text-sm font-medium">
                    No tasks found matching current search or filters.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={`bg-card/80 backdrop-blur-sm transition-all duration-300 border border-muted hover:border-muted-foreground/10 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${
                        task.completed ? 'task-complete-glow border-emerald-500/20' : 'hover:shadow-sm'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative inline-flex items-center justify-center h-5 w-5">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={(checked) => {
                                setBlastByTask(prev => ({
                                  ...prev,
                                  [task.id]: { key: Date.now(), variant: checked ? 'success' : 'danger' }
                                }));
                                if (checked) {
                                  completeTask(task.id);
                                } else {
                                  uncompleteTask(task.id);
                                }
                              }}
                              className={task.completed ? 'task-complete border-emerald-500 text-emerald-500 focus-visible:ring-2 focus-visible:ring-primary' : 'focus-visible:ring-2 focus-visible:ring-primary'}
                              aria-label={`Mark task "${task.text}" as complete`}
                            />
                            {blastByTask[task.id] && (
                              <BlastEffect
                                key={blastByTask[task.id].key}
                                variant={blastByTask[task.id].variant}
                                onDone={() => {
                                  setBlastByTask(prev => {
                                    const { [task.id]: _omit, ...rest } = prev;
                                    return rest;
                                  });
                                }}
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-foreground truncate text-sm sm:text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.text}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate italic">
                                {task.description}
                              </p>
                            )}
                            <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                              <Badge
                                variant="secondary"
                                className="text-[10px] sm:text-xs capitalize bg-primary/10 text-primary border-primary/20"
                              >
                                {task.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-[10px] sm:text-xs font-semibold ${
                                  {
                                    high: 'border-priority-high text-priority-high bg-priority-high/5',
                                    medium: 'border-priority-medium text-priority-medium bg-priority-medium/5',
                                    low: 'border-priority-low text-priority-low bg-priority-low/5',
                                  }[task.priority]
                                }`}
                              >
                                {task.priority} • {getXPForTask(task.priority)} XP
                              </Badge>
                              {(task.startDate || task.endDate || task.startTime || task.endTime) && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs bg-muted/40 text-muted-foreground">
                                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : '—'}
                                  {task.startTime ? ` ${task.startTime}` : ''}
                                  {" "}-{" "}
                                  {task.endDate ? new Date(task.endDate).toLocaleDateString() : '—'}
                                  {task.endTime ? ` ${task.endTime}` : ''}
                                </Badge>
                              )}
                              {task.reminderTime && !task.completed && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs text-warning border-warning bg-warning/5 animate-pulse">
                                  Reminder: {new Date(task.reminderTime).toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1 items-center shrink-0 ml-2">
                            {!task.completed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(task)}
                                className="text-xs h-8 px-2.5 focus-visible:ring-2 focus-visible:ring-primary"
                                aria-label={`Edit task "${task.text}"`}
                              >
                                Edit
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="text-xs h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-primary"
                              aria-label={`Delete task "${task.text}"`}
                            >
                              Delete
                            </Button>
                            
                            {task.completed && (
                              <div className="text-right text-[10px] text-muted-foreground border-l border-muted pl-3 min-w-[70px]">
                                <p className="font-bold text-success uppercase text-[8px]">Completed</p>
                                <p>+{getXPForTask(task.priority)} XP</p>
                                <p>{task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none">
            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-card/80 backdrop-blur-sm border border-muted">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Tasks Done</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-emerald-500">{completedCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm border border-muted">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completion Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-primary">
                    {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm border border-muted">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg XP per Completed Task</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-warning">
                    {completedCount > 0 ? Math.round(userStats.xp / completedCount) : 0} XP
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Productivity Trend Chart */}
              <Card className="bg-card/80 backdrop-blur-sm border border-muted">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    7-Day Productivity Trend
                  </CardTitle>
                  <CardDescription>Tasks completed per day over the last week</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <ChartTooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                          borderRadius: "8px",
                          fontSize: "12px"
                        }} 
                      />
                      <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} name="Completed Tasks" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category distribution pie chart */}
              <Card className="bg-card/80 backdrop-blur-sm border border-muted">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-primary" />
                    Category Breakdown
                  </CardTitle>
                  <CardDescription>Completed tasks by category</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pt-4 flex flex-col justify-between">
                  {completedCount === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground italic">
                      Complete tasks to see category distribution
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))", 
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                              borderRadius: "8px",
                              fontSize: "12px"
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] mt-2">
                        {categoryData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                            <span className="text-muted-foreground capitalize text-[10px] sm:text-xs">{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Priorities distribution bar chart */}
              <Card className="col-span-1 md:col-span-2 bg-card/80 backdrop-blur-sm border border-muted">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Tasks by Priority
                  </CardTitle>
                  <CardDescription>Comparison of completed vs ongoing tasks by priority</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <ChartTooltip
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                          borderRadius: "8px",
                          fontSize: "12px"
                        }}
                      />
                      <Legend verticalAlign="top" height={32} iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed Tasks" />
                      <Bar dataKey="Ongoing" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ongoing Tasks" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none">
            {/* Badges Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {BADGES.map((badge) => {
                const isUnlocked = userStats.badges?.includes(badge.id);
                const progress = getBadgeProgress(badge.id);
                const progressPercentage = Math.min((progress.current / progress.target) * 100, 100);

                return (
                  <Card 
                    key={badge.id} 
                    className={`relative overflow-hidden bg-card/60 backdrop-blur-sm border transition-all duration-300 ${
                      isUnlocked 
                        ? `border-primary bg-gradient-to-br ${badge.color} shadow-sm ring-1 ring-primary/25 scale-100` 
                        : 'border-muted opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <CardHeader className="pb-2 flex flex-row items-center gap-3">
                      <span className="text-3xl filter drop-shadow">{badge.icon}</span>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold">{badge.name}</CardTitle>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                          {isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="text-xs text-foreground/90 font-medium leading-relaxed">
                        {badge.description}
                      </CardDescription>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[120px]">{badge.requirement}</span>
                          <span>{progress.current} / {progress.target}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </ResponsiveSidebar>
      <ProfileModal />
      <TaskEditDialog
        task={editingTask}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={saveEditedTask}
        customCategories={customCategories}
      />

      {/* Share Task List Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Task List
            </DialogTitle>
            <DialogDescription>
              Share your current task list with others. The link includes your current filters and task status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-link">Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast({
                      title: "Link Copied! 📋",
                      description: "Share link copied to clipboard"
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>What's included:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>{filteredTasks.length} tasks</li>
                <li>Current filters and categories</li>
                <li>Task priorities and descriptions</li>
                <li>Completion status</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'My Task List',
                    text: `Check out my task list with ${filteredTasks.length} tasks!`,
                    url: shareLink
                  }).catch(console.error);
                }
              }}
              disabled={!navigator.share}
            >
              Share via App
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTaskId} onOpenChange={(open) => !open && setDeletingTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeletingTaskId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTask}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <footer className="relative z-10 text-center py-8 text-muted-foreground">
           <p>&copy; 2024 SmartDo Journey. Built by SPARKLE</p>
         </footer>
    </div>
    
  );
};

export default TodoApp;