import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Timer,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Task, CalendarEvent } from '../types';
import api from '../utils/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [quickTitle, setQuickTitle] = useState('');
  
  // Focus metrics
  const [focusToday, setFocusToday] = useState('1h 35m');
  const [focusSessions, setFocusSessions] = useState(3);
  const [focusStreak, setFocusStreak] = useState(5); // 5 days

  // Load data from backend API
  useEffect(() => {
    // 1. Fetch Tasks
    api.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => console.error('Failed to fetch tasks:', err));

    // 2. Fetch Events
    api.get('/events')
      .then((res) => setEvents(res.data))
      .catch((err) => console.error('Failed to fetch events:', err));

    // 3. Fetch Focus Stats
    api.get('/focus/stats')
      .then((res) => {
        const data = res.data;
        const hrs = Math.floor(data.todayMinutes / 60);
        const mins = data.todayMinutes % 60;
        setFocusToday(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
        setFocusSessions(data.totalSessions);
        setFocusStreak(data.streak);
      })
      .catch((err) => console.error('Failed to fetch focus stats:', err));
  }, []);

  // Toggle task completion on backend
  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'active' : 'completed';
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Quick add task on backend
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    try {
      const res = await api.post('/tasks', {
        title: quickTitle.trim(),
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
      });
      setTasks([res.data, ...tasks]);
      setQuickTitle('');
    } catch (err) {
      console.error('Failed to quick add task:', err);
    }
  };

  // Calculations
  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasksCount = tasks.length;
  const completedTasksCount = completedTasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Filter events for today and upcoming (next 3)
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 3);

  // Framer Motion staggered container
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.8, 0.25, 1] as any,
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      
      {/* Top Banner: Shortcuts / Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-sunshine-textMuted mt-0.5">
            Here's what is happening on your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/calendar"
            className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-card border border-border text-xs font-bold text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold flex items-center justify-center gap-2 transition-all duration-200"
          >
            <CalendarIcon size={14} />
            <span>Calendar</span>
          </Link>
          <Link
            to="/pomodoro"
            className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sunshine-gold/10 transition-all duration-300"
          >
            <Timer size={14} />
            <span>Start Focus</span>
          </Link>
        </div>
      </div>

      {/* Grid Dashboard Widgets */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        
        {/* Widget 1: Today's Progress Card */}
        <motion.div
          variants={cardVariants}
          className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-between hover:border-sunshine-gold/20 hover:shadow-2xl hover:shadow-sunshine-gold/5 transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase">
                Today's Progress
              </span>
              <TrendingUp className="text-sunshine-gold h-4 w-4" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-sunshine-textNearWhite tracking-tight">
                {progressPercent}%
              </span>
              <span className="text-xs text-sunshine-textMuted font-medium">
                completed
              </span>
            </div>
            <p className="text-xs text-sunshine-textMuted mt-1">
              {completedTasksCount} of {totalTasksCount} tasks checked off.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            {/* Horizontal Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#262626] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-sunshine-gold to-sunshine-orange"
              ></motion.div>
            </div>
            <div className="flex justify-between text-[10px] text-sunshine-textMuted font-bold">
              <span>BEGIN</span>
              <span className="text-sunshine-gold">SUNSHINE ZONE</span>
            </div>
          </div>
        </motion.div>

        {/* Widget 2: Focus Time Summary Card */}
        <motion.div
          variants={cardVariants}
          className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-between hover:border-sunshine-gold/20 hover:shadow-2xl hover:shadow-sunshine-gold/5 transition-all duration-300"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase">
                Focus Session
              </span>
              <Award className="text-sunshine-orange h-4 w-4" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-sunshine-textNearWhite tracking-tight">
                {focusToday}
              </span>
              <span className="text-xs text-sunshine-textMuted font-medium">
                focused today
              </span>
            </div>
            <p className="text-xs text-sunshine-textMuted mt-1">
              Completed {focusSessions} focus blocks in total.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-sunshine-gold" />
              <span className="text-xs text-sunshine-textNearWhite font-semibold">
                Streak: {focusStreak} days
              </span>
            </div>
            <span className="text-[10px] bg-sunshine-orange/10 text-sunshine-orange font-bold px-2 py-0.5 rounded-full border border-sunshine-orange/20">
              KEEP IT UP
            </span>
          </div>
        </motion.div>

        {/* Widget 3: Quick Add Task */}
        <motion.div
          variants={cardVariants}
          className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-between hover:border-sunshine-gold/20 hover:shadow-2xl hover:shadow-sunshine-gold/5 transition-all duration-300"
        >
          <div className="space-y-3">
            <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase block">
              Quick Add Task
            </span>
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full h-11 px-4 rounded-xl bg-[#1E1E1E] border border-border text-xs text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:border-sunshine-gold transition-all duration-200"
              />
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-card border border-border hover:border-sunshine-gold text-sunshine-textNearWhite hover:text-sunshine-gold font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </form>
          </div>
          <div className="text-[10px] text-sunshine-textMuted mt-4 pt-3 border-t border-border/30">
            Quick tasks default to <span className="text-sunshine-orange font-semibold">Medium Priority</span>.
          </div>
        </motion.div>

        {/* Widget 4: Today's Tasks List (Spans 2 columns on lg screens) */}
        <motion.div
          variants={cardVariants}
          className="p-6 rounded-2xl bg-card border border-border/60 lg:col-span-2 flex flex-col justify-between hover:border-sunshine-gold/20 transition-all duration-300"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase">
                Today's Tasks ({activeTasks.length})
              </span>
              <Link
                to="/todo"
                className="text-xs font-bold text-sunshine-gold hover:text-sunshine-orange flex items-center gap-1 transition-colors duration-200"
              >
                <span>View all</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* List */}
            <div className="mt-4 space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {activeTasks.length > 0 ? (
                activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-border/30 hover:border-border/80 transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="text-sunshine-textMuted hover:text-sunshine-gold transition-colors duration-150 flex-shrink-0"
                      >
                        <Circle size={18} />
                      </button>
                      <span className="text-xs font-medium text-sunshine-textNearWhite truncate pr-4">
                        {task.title}
                      </span>
                    </div>
                    
                    {/* Priority Badge */}
                    <span
                      className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : task.priority === 'medium'
                          ? 'bg-sunshine-orange/10 text-sunshine-orange border border-sunshine-orange/20'
                          : 'bg-sunshine-gold/10 text-sunshine-gold border border-sunshine-gold/20'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-sunshine-textMuted flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={32} className="text-sunshine-gold/40" />
                  <span>Hooray! No pending tasks left for today.</span>
                </div>
              )}
            </div>
          </div>

          {completedTasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/30 text-[11px] text-sunshine-textMuted flex items-center justify-between">
              <span>Recently completed: {completedTasks[0].title}</span>
              <span className="font-bold text-green-400">COMPLETED</span>
            </div>
          )}
        </motion.div>

        {/* Widget 5: Upcoming Events Widget */}
        <motion.div
          variants={cardVariants}
          className="p-6 rounded-2xl bg-card border border-border/60 flex flex-col justify-between hover:border-sunshine-gold/20 transition-all duration-300"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/40">
              <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase">
                Upcoming Schedule
              </span>
              <Link
                to="/calendar"
                className="text-xs font-bold text-sunshine-gold hover:text-sunshine-orange flex items-center gap-1 transition-colors duration-200"
              >
                <span>Calendar</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Event rows */}
            <div className="mt-4 space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => {
                  const isToday = event.date === todayStr;
                  const dateLabel = isToday 
                    ? 'Today' 
                    : new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  
                  return (
                    <div key={event.id} className="flex items-start gap-3">
                      {/* Left: Date Block */}
                      <div className="w-11 h-11 rounded-lg bg-[#141414] border border-border flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-sunshine-gold uppercase">
                          {isToday ? 'TOD' : new Date(event.date).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3)}
                        </span>
                        <span className="text-xs font-extrabold text-sunshine-textNearWhite">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      {/* Right: Content details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-sunshine-textNearWhite truncate leading-tight">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.color }}></span>
                          <span className="text-[10px] text-sunshine-textMuted font-medium truncate">
                            {event.category} · {event.startTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-sunshine-textMuted flex flex-col items-center justify-center gap-2">
                  <CalendarIcon size={32} className="text-sunshine-gold/40" />
                  <span>No upcoming events scheduled.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/30 text-[10px] text-sunshine-textMuted flex items-center justify-between font-bold">
            <span>UPCOMING ALERTS</span>
            <span className="text-sunshine-gold">ENABLED</span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default DashboardPage;
