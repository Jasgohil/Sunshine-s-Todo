import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  X,
  Bell,
  Check,
  AlertCircle
} from 'lucide-react';
import { CalendarEvent } from '../types';
import api from '../utils/api';

// Zod validation schema for Event Modal
const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  category: z.enum(['Work', 'Personal', 'Study', 'Health', 'Social']),
  color: z.string(),
  reminder: z.boolean(),
});

type EventFormValues = z.infer<typeof eventSchema>;

// Category metadata for colors and legend
const categories = {
  Work: { label: 'Work', color: '#F5C518', bg: 'bg-[#F5C518]/10', text: 'text-[#F5C518]', border: 'border-[#F5C518]/20' },
  Personal: { label: 'Personal', color: '#3B82F6', bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20' },
  Study: { label: 'Study', color: '#A855F7', bg: 'bg-[#A855F7]/10', text: 'text-[#A855F7]', border: 'border-[#A855F7]/20' },
  Health: { label: 'Health', color: '#EF4444', bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', border: 'border-[#EF4444]/20' },
  Social: { label: 'Social', color: '#FF8C42', bg: 'bg-[#FF8C42]/10', text: 'text-[#FF8C42]', border: 'border-[#FF8C42]/20' },
};

const colorsPool = ['#F5C518', '#3B82F6', '#A855F7', '#EF4444', '#FF8C42', '#10B981', '#EC4899'];

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // React Hook Form for Event creation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      category: 'Work',
      color: '#F5C518',
      reminder: true,
    },
  });

  const selectedColor = watch('color');
  const selectedCategory = watch('category');

  // Sync color with category automatically in form
  useEffect(() => {
    const color = categories[selectedCategory as keyof typeof categories]?.color || '#F5C518';
    setValue('color', color);
  }, [selectedCategory, setValue]);

  // Load events from backend API
  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data))
      .catch((err) => console.error('Failed to fetch events:', err));
  }, []);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Grid days array builders
  const getDaysInMonth = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, etc.
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const d = prevTotalDays - i;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Next month padding to fill 42 cells (6 rows × 7 cols)
    const remainingCells = 42 - days.length;
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    return days;
  };

  const daysGrid = getDaysInMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingEvent(null);
    reset({
      title: '',
      description: '',
      date: selectedDateStr,
      startTime: '12:00',
      endTime: '13:00',
      category: 'Work',
      color: '#F5C518',
      reminder: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    reset({
      title: event.title,
      description: event.description || '',
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime || '',
      category: event.category,
      color: event.color,
      reminder: event.reminder,
    });
    setIsModalOpen(true);
  };

  // Submit handler (Add or Edit)
  const onSubmit = async (data: EventFormValues) => {
    try {
      if (editingEvent) {
        // Edit
        const res = await api.put(`/events/${editingEvent.id}`, {
          title: data.title,
          description: data.description,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category,
          color: data.color,
          reminder: data.reminder,
        });
        setEvents(events.map(e => (e.id === editingEvent.id ? res.data : e)));
      } else {
        // Add
        const res = await api.post('/events', {
          title: data.title,
          description: data.description,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category,
          color: data.color,
          reminder: data.reminder,
        });
        setEvents([res.data, ...events]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  // Events on selected day
  const selectedDayEvents = events
    .filter(e => e.date === selectedDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine if a day has events
  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto select-none pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
            Calendar Planner
          </h1>
          <p className="text-xs text-sunshine-textMuted mt-0.5">
            Schedule and manage events with color-coded tags.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sunshine-gold/20 transition-all duration-300 cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Event</span>
        </button>
      </div>

      {/* Main Layout: 2 Columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Calendar Month view */}
        <div className="lg:col-span-2 bg-card border border-border/60 rounded-3xl p-6 space-y-6">
          
          {/* Calendar Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h2 className="text-lg font-black text-sunshine-textNearWhite tracking-tight">
                {monthNames[month]} {year}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-[#141414] border border-border/40 text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleGoToday}
                className="px-4 h-9 rounded-xl bg-[#141414] border border-border/40 text-xs font-bold text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-[#141414] border border-border/40 text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-extrabold text-sunshine-textMuted tracking-wider uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid cells */}
          <div className="grid grid-cols-7 gap-2.5">
            {daysGrid.map((day, index) => {
              const dateEvents = getEventsForDate(day.dateStr);
              const isSelected = day.dateStr === selectedDateStr;
              const isToday = day.dateStr === todayStr;
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`aspect-square p-2.5 rounded-2xl border flex flex-col justify-between items-center relative group transition-all duration-200 cursor-pointer ${
                    day.isCurrentMonth
                      ? isSelected
                        ? 'bg-[#141414] border-sunshine-gold'
                        : 'bg-[#141414]/40 border-border/30 hover:border-border/80'
                      : 'bg-transparent border-transparent text-sunshine-textMuted/40 cursor-default pointer-events-none'
                  }`}
                >
                  {/* Today Ring Indicator */}
                  {isToday && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-sunshine-orange shadow-md shadow-sunshine-orange/30"></div>
                  )}

                  {/* Day Number */}
                  <span
                    className={`text-xs font-bold ${
                      day.isCurrentMonth
                        ? isSelected
                          ? 'text-sunshine-gold'
                          : 'text-sunshine-textNearWhite'
                        : 'text-sunshine-textMuted/30'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {/* Event Dots */}
                  <div className="flex flex-wrap items-center justify-center gap-1 max-w-[80%] mt-auto h-2">
                    {day.isCurrentMonth &&
                      dateEvents.slice(0, 4).map((e) => (
                        <span
                          key={e.id}
                          className="w-1.5 h-1.5 rounded-full block animate-pulse"
                          style={{ backgroundColor: e.color }}
                        ></span>
                      ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Category Legend */}
          <div className="border-t border-border/40 pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {Object.values(categories).map((cat) => (
              <div key={cat.label} className="flex items-center gap-2 text-[10px] font-bold text-sunshine-textNearWhite uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: cat.color }}></span>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right 1 Column: Selected Day details panel */}
        <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-6 space-y-6 flex flex-col h-full min-h-[480px]">
          <div>
            <h2 className="text-md font-black text-sunshine-textNearWhite tracking-tight uppercase">
              Schedule Details
            </h2>
            <p className="text-xs text-sunshine-textMuted mt-0.5">
              {new Date(selectedDateStr).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Selected Date Events List */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => {
                const catMeta = categories[event.category as keyof typeof categories] || categories.Work;
                return (
                  <div
                    key={event.id}
                    className={`p-4 rounded-2xl border ${catMeta.bg} ${catMeta.border} relative group/event transition-all`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 min-w-0">
                        <h4 className="text-xs font-bold text-sunshine-textNearWhite truncate">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-[10px] text-sunshine-textMuted leading-relaxed line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-sunshine-textNearWhite uppercase tracking-wide pt-1">
                          <Clock size={11} className="text-sunshine-gold" />
                          <span>
                            {event.startTime} {event.endTime ? ` - ${event.endTime}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover/event:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => handleOpenEdit(event)}
                          className="p-1 rounded bg-card/80 text-sunshine-textMuted hover:text-sunshine-gold transition-colors"
                        >
                          <Plus size={12} className="rotate-45" /> {/* Just edit trigger placeholder or use lucide icon */}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 rounded bg-card/80 text-sunshine-textMuted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center text-xs text-sunshine-textMuted flex flex-col items-center justify-center gap-2 h-full">
                <CalendarIcon size={36} className="text-sunshine-gold/30 animate-pulse" />
                <span>No events today. Rest or plan ahead!</span>
              </div>
            )}
          </div>

          {/* Quick add event inside side panel */}
          <button
            onClick={handleOpenAdd}
            className="w-full h-11 mt-auto rounded-xl bg-[#141414] border border-border hover:border-sunshine-gold text-sunshine-textNearWhite hover:text-sunshine-gold font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Event</span>
          </button>
        </div>

      </div>

      {/* Add / Edit Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#000]/80 backdrop-blur-sm z-40"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] as any }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-[#121212]">
                <h2 className="text-sm font-bold text-sunshine-textNearWhite uppercase tracking-wide">
                  {editingEvent ? 'Modify Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Design Sync"
                    {...register('title')}
                    className={`w-full h-11 px-4 rounded-xl bg-[#121212] border ${
                      errors.title ? 'border-red-500' : 'border-border'
                    } text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold`}
                  />
                  {errors.title && (
                    <p className="text-[10px] font-bold text-red-400 mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., review design artifacts"
                    {...register('description')}
                    className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold"
                  />
                </div>

                {/* Category Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full h-11 px-3 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Study">Study</option>
                      <option value="Health">Health</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                      Date *
                    </label>
                    <input
                      type="date"
                      {...register('date')}
                      className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
                    />
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      {...register('startTime')}
                      className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                      End Time
                    </label>
                    <input
                      type="time"
                      {...register('endTime')}
                      className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
                    />
                  </div>
                </div>

                {/* Reminder toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121212] border border-border/40">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-sunshine-gold" />
                    <span className="text-xs text-sunshine-textNearWhite font-medium">Send notification reminder</span>
                  </div>
                  <input
                    type="checkbox"
                    {...register('reminder')}
                    className="w-4 h-4 text-sunshine-gold bg-[#121212] border-border rounded focus:ring-sunshine-gold focus:ring-1 cursor-pointer accent-sunshine-gold"
                  />
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-11 px-5 rounded-xl bg-card border border-border text-xs font-bold text-sunshine-textNearWhite hover:border-sunshine-gold transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-xs tracking-wide shadow-md shadow-sunshine-gold/10 flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer"
                  >
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
