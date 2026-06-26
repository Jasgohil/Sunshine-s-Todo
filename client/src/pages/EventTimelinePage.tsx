import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Trash2,
  FolderDot,
  CalendarDays
} from 'lucide-react';
import { CalendarEvent } from '../types';
import api from '../utils/api';

// Category color configurations
const categories = {
  Work: { color: '#F5C518', bg: 'bg-[#F5C518]/10', border: 'border-[#F5C518]/20', text: 'text-[#F5C518]' },
  Personal: { color: '#3B82F6', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/20', text: 'text-[#3B82F6]' },
  Study: { color: '#A855F7', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/20', text: 'text-[#A855F7]' },
  Health: { color: '#EF4444', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20', text: 'text-[#EF4444]' },
  Social: { color: '#FF8C42', bg: 'bg-[#FF8C42]/10', border: 'border-[#FF8C42]/20', text: 'text-[#FF8C42]' },
};

const EventTimelinePage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Load events from backend timeline API
  useEffect(() => {
    api.get('/events/timeline')
      .then((res) => setEvents(res.data))
      .catch((err) => console.error('Failed to fetch timeline:', err));
  }, []);

  // Delete event from timeline on backend
  const handleDeleteEvent = async (id: string) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Filter and sort events chronologically (newest first, i.e. desc date and time)
  const filteredEvents = events
    .filter((event) => {
      // 1. Search Query filter (matches title and description)
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category filter
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;

      // 3. Date range filters
      const matchesFromDate = !fromDate || event.date >= fromDate;
      const matchesToDate = !toDate || event.date <= toDate;

      return matchesSearch && matchesCategory && matchesFromDate && matchesToDate;
    })
    .sort((a, b) => {
      // Sort newest at top: descending order of date, then time
      return `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`);
    });

  // Helper to format date beautifully
  const formatDateBeautiful = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Framer Motion staggered animations
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
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.45,
        ease: [0.25, 0.8, 0.25, 1] as any,
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto select-none pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
            Event History Timeline
          </h1>
          <p className="text-xs text-sunshine-textMuted mt-0.5">
            Track all your scheduled events in a chronological flowing timeline.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Toolbar */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title, details..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:border-sunshine-gold focus:ring-1 focus:ring-sunshine-gold/20 transition-all duration-200"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-48 relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
              <option value="Health">Health</option>
              <option value="Social">Social</option>
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-sunshine-textMuted uppercase tracking-wider min-w-[32px]">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="flex-1 sm:flex-initial h-10 px-3.5 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-sunshine-textMuted uppercase tracking-wider min-w-[32px]">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="flex-1 sm:flex-initial h-10 px-3.5 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
            />
          </div>

          {/* Reset Filters button */}
          {(searchQuery || categoryFilter !== 'All' || fromDate || toDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setFromDate('');
                setToDate('');
              }}
              className="text-[10px] font-bold text-sunshine-orange hover:text-sunshine-gold transition-colors ml-auto sm:ml-2 cursor-pointer uppercase tracking-wider"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative pl-6 md:pl-8 ml-4 md:ml-6">
        {/* Pulsing neon gold vertical line connector */}
        <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-sunshine-gold via-sunshine-orange to-sunshine-gold/20 rounded-full shadow-lg shadow-sunshine-gold/50"></div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const catMeta = categories[event.category as keyof typeof categories] || categories.Work;
                
                return (
                  <motion.div
                    key={event.id}
                    layout
                    variants={cardVariants}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative group"
                  >
                    {/* Pulsing Dot on timeline */}
                    <div
                      className="absolute left-[-32px] md:left-[-40px] top-5 w-4 h-4 rounded-full border-2 border-[#0D0D0D] shadow-md z-10 transition-transform duration-300 group-hover:scale-125 cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: catMeta.color }}
                    >
                      <div className="w-1 h-1 rounded-full bg-white animate-ping"></div>
                    </div>

                    {/* Timeline Event Card Box */}
                    <div className="bg-card border border-border/60 hover:border-sunshine-gold/20 rounded-2xl p-5 hover:shadow-2xl hover:shadow-sunshine-gold/5 transition-all duration-300 relative overflow-hidden">
                      
                      {/* Top Accent Strip */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: catMeta.color }}
                      ></div>

                      <div className="pl-3 flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          
                          {/* Header row: Title + Category badge */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-sm font-black text-sunshine-textNearWhite leading-snug truncate pr-2">
                              {event.title}
                            </h3>
                            <span
                              className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border ${catMeta.bg} ${catMeta.text} ${catMeta.border}`}
                            >
                              {event.category}
                            </span>
                          </div>

                          {/* Description details */}
                          {event.description && (
                            <p className="text-xs text-sunshine-textMuted leading-relaxed max-w-2xl pr-4">
                              {event.description}
                            </p>
                          )}

                          {/* Date and Time Chips */}
                          <div className="flex flex-wrap items-center gap-4 text-[10px] text-sunshine-textMuted font-bold pt-1 border-t border-border/20">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon size={12} className="text-sunshine-gold" />
                              <span>{formatDateBeautiful(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sunshine-orange">
                              <Clock size={12} />
                              <span>
                                {event.startTime} {event.endTime ? ` - ${event.endTime}` : ''}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Right Actions column */}
                        <div className="flex items-center justify-end md:self-start flex-shrink-0 pt-1">
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 rounded-lg text-sunshine-textMuted hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
                            title="Delete Timeline Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-20 text-center text-xs text-sunshine-textMuted flex flex-col items-center justify-center gap-3 border border-dashed border-border/60 rounded-3xl bg-card/20 pr-6 md:pr-8">
                <History size={44} className="text-sunshine-gold/30 animate-pulse" />
                <span>No events match your search filters or range.</span>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
};

export default EventTimelinePage;
