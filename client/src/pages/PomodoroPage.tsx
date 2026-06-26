import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Target,
  FileText,
  TrendingUp,
  Flame,
  Award,
  Calendar,
  Sparkles,
  Volume2,
  Maximize2,
  Timer,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../utils/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock charts data
const weeklyData = [
  { day: 'Mon', hours: 1.5 },
  { day: 'Tue', hours: 2.5 },
  { day: 'Wed', hours: 2.0 },
  { day: 'Thu', hours: 3.5 },
  { day: 'Fri', hours: 1.5 },
  { day: 'Sat', hours: 0.5 },
  { day: 'Sun', hours: 1.0 },
];

const monthlyData = [
  { week: 'W1', hours: 8.5 },
  { week: 'W2', hours: 12.0 },
  { week: 'W3', hours: 10.5 },
  { week: 'W4', hours: 15.0 },
];

const trendData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  minutes: Math.round(30 + Math.random() * 90),
}));

const PomodoroPage: React.FC = () => {
  // Focus stats state
  const [stats, setStats] = useState<any>({
    todayMinutes: 95,
    weekMinutes: 750,
    totalSessions: 184,
    longestSession: 90,
    streak: 5,
    dailyBreakdown: [],
  });

  const [sessions, setSessions] = useState<any[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  const fetchStats = () => {
    api.get('/focus/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to fetch focus stats:', err));
  };

  const fetchSessions = () => {
    api.get('/focus/sessions')
      .then((res) => setSessions(res.data))
      .catch((err) => console.error('Failed to fetch focus sessions:', err));
  };

  const deleteSession = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this focus session from your history?')) {
      return;
    }
    try {
      await api.delete(`/focus/session/${id}`);
      fetchStats();
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete focus session:', err);
      alert('Failed to delete focus session. Please try again.');
    }
  };

  const toggleExpandSession = (id: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    fetchStats();
    fetchSessions();
    const savedNotes = localStorage.getItem('sunshine_pomodoro_notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  // Timer states
  const [mode, setMode] = useState<'25/5' | '50/10' | '90/20' | 'custom'>('25/5');
  const [customTime, setCustomTime] = useState(25); // minutes for custom
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalDuration, setTotalDuration] = useState(25 * 60);

  // Notes and goals
  const [goal, setGoal] = useState('Build Sunshine design system flow');
  const [notes, setNotes] = useState('');

  // Audio elements (mock)
  const [audioSource, setAudioSource] = useState<'none' | 'rain' | 'lofi' | 'waves'>('none');

  const timerRef = useRef<any>(null);

  // Initialize timer durations when mode changes
  useEffect(() => {
    setIsActive(false);
    setIsBreak(false);
    let minutes = 25;
    
    if (mode === '25/5') {
      minutes = isBreak ? 5 : 25;
    } else if (mode === '50/10') {
      minutes = isBreak ? 10 : 50;
    } else if (mode === '90/20') {
      minutes = isBreak ? 20 : 90;
    } else if (mode === 'custom') {
      minutes = isBreak ? Math.max(1, Math.round(customTime * 0.2)) : customTime;
    }

    setTimeLeft(minutes * 60);
    setTotalDuration(minutes * 60);
  }, [mode, isBreak, customTime]);

  // Handle countdown interval
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            
            // Handle phase switch
            if (!isBreak) {
              // Work session completed!
              alert('Congratulations! Focus session complete. Time for a break! 🎉');
              
              // Log focus session to backend
              const durationMinutes = Math.round(totalDuration / 60);
              const startedAt = new Date(Date.now() - totalDuration * 1000).toISOString();
              const completedAt = new Date().toISOString();

              api.post('/focus/session', {
                mode,
                durationMinutes,
                startedAt,
                completedAt,
                notes: notes || undefined,
              })
                .then(() => {
                  fetchStats();
                  fetchSessions();
                  setNotes('');
                  localStorage.removeItem('sunshine_pomodoro_notes');
                })
                .catch((err) => console.error('Failed to log focus session:', err));

              setIsBreak(true);
            } else {
              // Break completed!
              alert('Break complete. Let\'s get back to focus! 🚀');
              setIsBreak(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isBreak, totalDuration, mode, notes]);

  // Pause / Start
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Reset
  const resetTimer = () => {
    setIsActive(false);
    let minutes = 25;
    if (mode === '25/5') minutes = isBreak ? 5 : 25;
    else if (mode === '50/10') minutes = isBreak ? 10 : 50;
    else if (mode === '90/20') minutes = isBreak ? 20 : 90;
    else if (mode === 'custom') minutes = isBreak ? Math.max(1, Math.round(customTime * 0.2)) : customTime;
    
    setTimeLeft(minutes * 60);
    setTotalDuration(minutes * 60);
  };

  const saveSessionManually = async () => {
    const elapsedSeconds = totalDuration - timeLeft;
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const startedAt = new Date(Date.now() - elapsedSeconds * 1000).toISOString();
    const completedAt = new Date().toISOString();

    try {
      await api.post('/focus/session', {
        mode,
        durationMinutes,
        startedAt,
        completedAt,
        notes: notes || 'Manual session log',
      });
      fetchStats();
      fetchSessions();
      setNotes('');
      localStorage.removeItem('sunshine_pomodoro_notes');
      alert('Focus session and notes saved successfully! 🎉');
      resetTimer();
    } catch (err) {
      console.error('Failed to log focus session manually:', err);
      alert('Failed to save session notes. Please try again.');
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // SVG Circular progress math
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalDuration > 0 ? circumference - (timeLeft / totalDuration) * circumference : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto select-none pb-16">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
          Focus & Pomodoro Workspace
        </h1>
        <p className="text-xs text-sunshine-textMuted mt-0.5">
          Work in highly focused block sessions, track intentions, and view analytics.
        </p>
      </div>

      {/* Grid: Timer Left, Panel Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Columns: Focus Timer */}
        <div className="lg:col-span-2 bg-card border border-border/60 rounded-3xl p-8 flex flex-col items-center justify-between min-h-[480px] relative overflow-hidden">
          
          {/* Subtle Ambient Background pulse */}
          {isActive && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute w-[300px] h-[300px] rounded-full bg-sunshine-gold/5 blur-3xl pointer-events-none z-0"
            ></motion.div>
          )}

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#141414] rounded-xl border border-border/40 z-10">
            {([
              { key: '25/5', label: '25 / 5' },
              { key: '50/10', label: '50 / 10' },
              { key: '90/20', label: '90 / 20' },
              { key: 'custom', label: 'Custom' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  mode === tab.key
                    ? 'bg-card text-sunshine-gold border border-border/60 shadow'
                    : 'text-sunshine-textMuted hover:text-sunshine-textNearWhite'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Time Slider (if in custom mode) */}
          {mode === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 flex items-center gap-3 w-64 z-10"
            >
              <span className="text-[10px] font-bold text-sunshine-textMuted uppercase">Time:</span>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={customTime}
                onChange={(e) => setCustomTime(Number(e.target.value))}
                className="flex-1 accent-sunshine-gold bg-border h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-extrabold text-sunshine-gold w-12 text-right">
                {customTime}m
              </span>
            </motion.div>
          )}

          {/* Large Circular Timer ring */}
          <div className="relative flex items-center justify-center my-6 z-10">
            
            {/* SVG Circle Timer Container */}
            <svg className="w-56 h-56 transform -rotate-90">
              {/* Outer Background Ring */}
              <circle
                cx="112"
                cy="112"
                r={radius}
                className="stroke-[#141414]"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Active Foreground Progress Circle */}
              <motion.circle
                cx="112"
                cy="112"
                r={radius}
                className={`${isBreak ? 'stroke-sunshine-orange' : 'stroke-sunshine-gold'}`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Time value inside SVG */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-extrabold tracking-widest uppercase mb-1" style={{ color: isBreak ? '#FF8C42' : '#F5C518' }}>
                {isBreak ? 'BREAK PHASE' : 'FOCUS PHASE'}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold font-serif text-sunshine-textNearWhite tracking-tight">
                {formatTime(timeLeft)}
              </h2>
              {isActive && (
                <span className="text-[9px] text-sunshine-textMuted font-bold uppercase tracking-wider mt-1.5 animate-pulse">
                  TIMER ACTIVE
                </span>
              )}
            </div>

          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4 z-10">
            
            {/* Reset Button */}
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-card border border-border text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold transition-all cursor-pointer shadow"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            {/* Main Play/Pause CTA */}
            <button
              onClick={toggleTimer}
              className="h-14 w-36 rounded-full bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide shadow-lg shadow-sunshine-gold/20 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/30 transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
            >
              {isActive ? (
                <>
                  <Pause size={18} fill="currentColor" /> Pause
                </>
              ) : (
                <>
                  <Play size={18} fill="currentColor" /> Focus
                </>
              )}
            </button>

            {/* Ambient Sound Selector */}
            <div className="relative group">
              <button
                className="p-3 rounded-full bg-card border border-border text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold transition-all cursor-pointer shadow"
                title="Ambient Sound"
              >
                <Volume2 size={18} />
              </button>
              
              {/* Audio quick select menu */}
              <div className="absolute bottom-12 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom p-2 rounded-xl bg-card border border-border shadow-2xl flex flex-col gap-1 z-50">
                {(['none', 'rain', 'lofi', 'waves'] as const).map(sound => (
                  <button
                    key={sound}
                    onClick={() => setAudioSource(sound)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ${
                      audioSource === sound
                        ? 'bg-sunshine-gold/10 text-sunshine-gold'
                        : 'text-sunshine-textMuted hover:text-sunshine-textNearWhite'
                    }`}
                  >
                    {sound}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Goal & Notes Panel */}
        <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-6 flex flex-col justify-between gap-6">
          
          {/* Section 1: Intent Goal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide">
              <Target className="text-sunshine-gold" size={16} />
              <span>Today's Intention</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-border/40">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Write one clear intention..."
                className="w-full bg-transparent border-none text-xs font-medium text-sunshine-textNearWhite focus:outline-none placeholder-sunshine-textMuted"
              />
            </div>
          </div>

          {/* Section 2: Session Notes */}
          <div className="flex-1 flex flex-col space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide">
              <FileText className="text-sunshine-orange" size={16} />
              <span>Session Notes</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                localStorage.setItem('sunshine_pomodoro_notes', e.target.value);
              }}
              placeholder="Jot down insights, task steps, or stray thoughts to review later..."
              className="flex-grow p-4 rounded-2xl bg-[#141414] border border-border/40 text-xs text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:border-sunshine-gold resize-none min-h-[160px] leading-relaxed"
            />
            
            {/* Save Session Notes Button */}
            <button
              onClick={saveSessionManually}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange hover:from-sunshine-gold hover:to-sunshine-orange text-sunshine-darkBg font-black text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <FileText size={14} />
              <span>Save Focus Session & Notes</span>
            </button>
          </div>

          {/* Section 3: Extra tip */}
          <div className="p-3.5 bg-sunshine-gold/5 rounded-2xl border border-sunshine-gold/10 flex items-center gap-2 text-[10px] text-sunshine-textMuted leading-snug">
            <Sparkles size={14} className="text-sunshine-gold flex-shrink-0" />
            <span>Pro tip: Block notifications, take regular standing breaks, and log insights immediately!</span>
          </div>

        </div>

      </div>

      {/* Section 3: Productivity Analytics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1 */}
        <div className="bg-card border border-border/60 p-5 rounded-2xl flex items-center gap-4 hover:border-sunshine-gold/20 transition-all duration-300">
          <div className="p-3 rounded-xl bg-sunshine-gold/10 border border-sunshine-gold/20 text-sunshine-gold">
            <Timer size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sunshine-textMuted uppercase tracking-wider block">Focus Today</span>
            <span className="text-xl font-extrabold text-sunshine-textNearWhite mt-0.5 block">
              {Math.floor(stats.todayMinutes / 60) > 0 ? `${Math.floor(stats.todayMinutes / 60)}h ${stats.todayMinutes % 60}m` : `${stats.todayMinutes % 60}m`}
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-card border border-border/60 p-5 rounded-2xl flex items-center gap-4 hover:border-sunshine-gold/20 transition-all duration-300">
          <div className="p-3 rounded-xl bg-sunshine-orange/10 border border-sunshine-orange/20 text-sunshine-orange">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sunshine-textMuted uppercase tracking-wider block">This Week</span>
            <span className="text-xl font-extrabold text-sunshine-textNearWhite mt-0.5 block">
              {parseFloat((stats.weekMinutes / 60).toFixed(1))} hrs
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-card border border-border/60 p-5 rounded-2xl flex items-center gap-4 hover:border-sunshine-gold/20 transition-all duration-300">
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sunshine-textMuted uppercase tracking-wider block">Total Sessions</span>
            <span className="text-xl font-extrabold text-sunshine-textNearWhite mt-0.5 block">
              {stats.totalSessions} blocks
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-card border border-border/60 p-5 rounded-2xl flex items-center gap-4 hover:border-sunshine-gold/20 transition-all duration-300">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <Flame size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sunshine-textMuted uppercase tracking-wider block">Longest session</span>
            <span className="text-xl font-extrabold text-sunshine-textNearWhite mt-0.5 block">
              {stats.longestSession} min
            </span>
          </div>
        </div>

      </div>

      {/* Section 4: Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Weekly Hours (BarChart) */}
        <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-6 space-y-4 hover:border-sunshine-gold/25 transition-colors duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide border-b border-border/30 pb-3">
            <TrendingUp size={14} className="text-sunshine-gold" />
            <span>Weekly Focus Hours</span>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.dailyBreakdown && stats.dailyBreakdown.length > 0
                  ? stats.dailyBreakdown.map((item: any) => ({
                      day: item.day,
                      hours: parseFloat((item.minutes / 60).toFixed(1)),
                    }))
                  : weeklyData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="day" stroke="#6B6B6B" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B6B6B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #262626', borderRadius: '8px' }}
                  labelStyle={{ color: '#F0F0F0', fontWeight: 'bold' }}
                />
                <Bar dataKey="hours" fill="#F5C518" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Focus Breakdown (AreaChart) */}
        <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-6 space-y-4 hover:border-sunshine-gold/25 transition-colors duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide border-b border-border/30 pb-3">
            <TrendingUp size={14} className="text-sunshine-orange" />
            <span>Monthly Focus Hours</span>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0 ? stats.monthlyBreakdown : monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF8C42" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="week" stroke="#6B6B6B" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B6B6B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #262626', borderRadius: '8px' }}
                  labelStyle={{ color: '#F0F0F0', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#FF8C42" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: 30-Day Focus Trend (LineChart) */}
        <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-6 space-y-4 hover:border-sunshine-gold/25 transition-colors duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide border-b border-border/30 pb-3">
            <TrendingUp size={14} className="text-purple-400" />
            <span>30-Day Trend (minutes)</span>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.thirtyDayTrend && stats.thirtyDayTrend.length > 0 ? stats.thirtyDayTrend : trendData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="day" stroke="#6B6B6B" fontSize={8} tickLine={false} />
                <YAxis stroke="#6B6B6B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #262626', borderRadius: '8px' }}
                  labelStyle={{ color: '#F0F0F0', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#A855F7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Section 5: Focus History & Notes List */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-4 hover:border-sunshine-gold/10 transition-colors duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide">
            <Clock size={16} className="text-sunshine-gold" />
            <span>Focus Session Log & Notes</span>
          </div>
          {sessions.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-border/40 text-[9px] font-black text-sunshine-gold uppercase">
              {sessions.length} recorded {sessions.length === 1 ? 'session' : 'sessions'}
            </span>
          )}
        </div>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/40 rounded-2xl bg-[#141414]/30 space-y-3">
            <div className="p-3 rounded-full bg-sunshine-gold/5 border border-sunshine-gold/15 text-sunshine-gold">
              <FileText size={24} className="opacity-60" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-sunshine-textNearWhite">No focus sessions recorded yet</p>
              <p className="text-[10px] text-sunshine-textMuted max-w-sm mt-0.5 leading-normal">
                Work through a focus interval or manually save your current session note to start building your log.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border/40">
            <AnimatePresence initial={false}>
              {sessions.map((session) => {
                const isExpanded = !!expandedSessions[session.id];
                const hasNotes = session.notes && session.notes.trim().length > 0;
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-[#141414] border border-border/40 hover:border-border/60 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {/* Mode badge */}
                        <span className="px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full bg-sunshine-gold/10 text-sunshine-gold border border-sunshine-gold/20">
                          {session.mode} Mode
                        </span>
                        
                        {/* Duration */}
                        <span className="text-xs font-extrabold text-sunshine-textNearWhite flex items-center gap-1.5">
                          <Timer size={13} className="text-sunshine-orange" />
                          {session.durationMinutes} min
                        </span>

                        {/* Completed Date */}
                        <span className="text-[10px] text-sunshine-textMuted font-bold uppercase flex items-center gap-1">
                          <Calendar size={12} className="opacity-50" />
                          {(() => {
                            try {
                              const d = new Date(session.completedAt);
                              return d.toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                            } catch (e) {
                              return session.completedAt;
                            }
                          })()}
                        </span>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {hasNotes && (
                          <button
                            onClick={() => toggleExpandSession(session.id)}
                            className="px-3 py-1.5 rounded-xl bg-card border border-border text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase shadow-sm"
                          >
                            <FileText size={12} />
                            <span>Notes</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="p-1.5 rounded-xl bg-card border border-border text-sunshine-textMuted hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer shadow-sm"
                          title="Delete Session Log"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Notes Panel */}
                    <AnimatePresence>
                      {isExpanded && hasNotes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 mt-3 rounded-xl bg-card/60 border border-border/20 text-xs text-sunshine-textNearWhite whitespace-pre-wrap leading-relaxed font-medium">
                            {session.notes}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>

    </div>
  );
};

export default PomodoroPage;
