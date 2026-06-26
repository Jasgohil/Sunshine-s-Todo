import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Calendar,
  FileText,
  Archive as ArchiveIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Book,
  Quote as QuoteIcon
} from 'lucide-react';
import { JazzyNote, Poem, DailyQuote } from '../../types';
import api from '../../utils/api';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'library' | 'archive'>('notes');
  
  // States
  const [notes, setNotes] = useState<JazzyNote[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);

  // Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<JazzyNote | null>(null);
  
  // Note Form Fields
  const [noteContent, setNoteContent] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [notePublished, setNotePublished] = useState(true);

  // Load scheduled notes and poems from backend admin endpoints
  useEffect(() => {
    // 1. Fetch scheduled daily notes
    api.get('/admin/notes')
      .then((res) => setNotes(res.data))
      .catch((err) => console.error('Failed to fetch admin notes:', err));

    // 2. Fetch poetry catalog
    api.get('/admin/poems')
      .then((res) => setPoems(res.data))
      .catch((err) => console.error('Failed to fetch admin poems:', err));
  }, []);

  // Toggle Publish Status on backend
  const togglePublishStatus = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    try {
      const res = await api.put(`/admin/notes/${id}`, {
        content: note.content,
        scheduledDate: note.scheduledDate,
        isPublished: !note.isPublished,
      });
      setNotes(notes.map((n) => (n.id === id ? res.data : n)));
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  // Delete note on backend
  const handleDeleteNote = async (id: string) => {
    try {
      await api.delete(`/admin/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // Delete poem on backend
  const handleDeletePoem = async (id: string) => {
    try {
      await api.delete(`/admin/poems/${id}`);
      setPoems(poems.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete poem:', err);
    }
  };

  // Open note modal for add
  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteContent('');
    setNoteDate(new Date().toISOString().split('T')[0]);
    setNotePublished(true);
    setIsNoteModalOpen(true);
  };

  // Open note modal for edit
  const handleOpenEditNote = (note: JazzyNote) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setNoteDate(note.scheduledDate);
    setNotePublished(note.isPublished);
    setIsNoteModalOpen(true);
  };

  // Submit note (Add or Edit) on backend
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !noteDate) return;

    try {
      if (editingNote) {
        // Edit
        const res = await api.put(`/admin/notes/${editingNote.id}`, {
          content: noteContent.trim(),
          scheduledDate: noteDate,
          isPublished: notePublished,
        });
        setNotes(notes.map((n) => (n.id === editingNote.id ? res.data : n)));
      } else {
        // Add
        const res = await api.post('/admin/notes', {
          content: noteContent.trim(),
          scheduledDate: noteDate,
          isPublished: notePublished,
        });
        setNotes([res.data, ...notes]);
      }
      setIsNoteModalOpen(false);
    } catch (err) {
      console.error('Failed to save scheduled note:', err);
    }
  };

  // Filter notes for the active and archive tabs
  const activeNotes = notes.filter(n => n.isPublished).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  const archivedNotes = notes.filter(n => !n.isPublished).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  return (
    <div className="max-w-5xl mx-auto select-none pb-16 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
              Administrator Dashboard
            </h1>
            <p className="text-xs text-sunshine-textMuted mt-0.5">
              Configure daily scheduled notes, manage the poetry catalog, and review published content.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-px">
        {(['notes', 'library', 'archive'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-sunshine-gold text-sunshine-gold'
                : 'border-transparent text-sunshine-textMuted hover:text-sunshine-textNearWhite'
            }`}
          >
            {tab === 'notes' && 'Daily Inspiration Notes'}
            {tab === 'library' && 'Content Library'}
            {tab === 'archive' && 'Unpublished / Draft Archive'}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Daily Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase">
              Scheduled Daily Notes ({activeNotes.length})
            </span>
            <button
              onClick={handleOpenAddNote}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-xs tracking-wide flex items-center justify-center gap-2 hover:shadow-md transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Schedule Note</span>
            </button>
          </div>

          {/* Notes table */}
          <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#121212] border-b border-border/60 text-sunshine-textMuted font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-36">Scheduled Date</th>
                  <th className="px-6 py-4">Content Excerpt</th>
                  <th className="px-6 py-4 w-32 text-center">Status</th>
                  <th className="px-6 py-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {activeNotes.length > 0 ? (
                  activeNotes.map(note => (
                    <tr key={note.id} className="hover:bg-[#141414]/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-sunshine-gold">
                        {note.scheduledDate}
                      </td>
                      <td className="px-6 py-4 font-serif text-sunshine-textNearWhite/90 whitespace-pre-line line-clamp-1 py-4 block max-w-xl">
                        {note.content.length > 120 ? note.content.slice(0, 120) + '...' : note.content}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePublishStatus(note.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all font-semibold"
                          title="Click to unpublish"
                        >
                          <CheckCircle size={12} />
                          <span>Published</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditNote(note)}
                            className="p-2 rounded bg-[#141414] text-sunshine-textMuted hover:text-sunshine-gold transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 rounded bg-[#141414] text-sunshine-textMuted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-sunshine-textMuted italic">
                      No active daily notes scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Content Library (Poems & Quotes) */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Poetry Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide">
                <Book size={14} className="text-sunshine-gold" />
                <span>Poetry pool ({poems.length})</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {poems.map(poem => (
                <div key={poem.id} className="p-5 rounded-2xl bg-card border border-border/60 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-sunshine-textNearWhite">{poem.title}</h4>
                      <span className="text-[10px] text-sunshine-textMuted font-medium block">by {poem.author}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePoem(poem.id)}
                      className="p-1.5 rounded text-sunshine-textMuted hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] font-serif text-sunshine-textMuted italic whitespace-pre-line line-clamp-3">
                    {poem.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quotes Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textNearWhite uppercase tracking-wide">
                <QuoteIcon size={14} className="text-sunshine-orange" />
                <span>Quote pool</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-dashed border-border/60 text-center text-xs text-sunshine-textMuted py-16">
              Content quotes pool is loaded dynamically from daily asset packs.
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Archive (Unpublished drafts) */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          <span className="text-xs font-bold text-sunshine-textMuted tracking-wider uppercase block">
            Draft & unpublished daily notes archive ({archivedNotes.length})
          </span>

          <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#121212] border-b border-border/60 text-sunshine-textMuted font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-36">Scheduled Date</th>
                  <th className="px-6 py-4">Content Excerpt</th>
                  <th className="px-6 py-4 w-32 text-center">Status</th>
                  <th className="px-6 py-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {archivedNotes.length > 0 ? (
                  archivedNotes.map(note => (
                    <tr key={note.id} className="hover:bg-[#141414]/30 transition-colors opacity-75">
                      <td className="px-6 py-4 font-bold text-sunshine-textMuted">
                        {note.scheduledDate}
                      </td>
                      <td className="px-6 py-4 font-serif text-sunshine-textMuted/90 whitespace-pre-line line-clamp-1 py-4 block max-w-xl">
                        {note.content}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePublishStatus(note.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20 transition-all font-semibold"
                          title="Click to publish"
                        >
                          <XCircle size={12} />
                          <span>Unpublished</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditNote(note)}
                            className="p-2 rounded bg-[#141414] text-sunshine-textMuted hover:text-sunshine-gold transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 rounded bg-[#141414] text-sunshine-textMuted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-sunshine-textMuted italic">
                      No draft or archived notes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note Edit / Add Modal */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNoteModalOpen(false)}
              className="fixed inset-0 bg-[#000]/80 backdrop-blur-sm z-40"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-[#121212]">
                <h2 className="text-sm font-bold text-sunshine-textNearWhite uppercase tracking-wide">
                  {editingNote ? 'Edit Inspiration Note' : 'Schedule New Note'}
                </h2>
                <button
                  onClick={() => setIsNoteModalOpen(false)}
                  className="p-1 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveNote} className="p-6 space-y-4">
                
                {/* Scheduled Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                    Publish Schedule Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
                  />
                </div>

                {/* Note Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                    Note Content (Text area) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write a warm daily note or check-in to display as Jazzy's letter..."
                    className="w-full px-4 py-3 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:border-sunshine-gold resize-none leading-relaxed"
                  />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121212] border border-border/40">
                  <span className="text-xs text-sunshine-textNearWhite font-medium">Publish instantly to scheduled date</span>
                  <input
                    type="checkbox"
                    checked={notePublished}
                    onChange={(e) => setNotePublished(e.target.checked)}
                    className="w-4 h-4 text-sunshine-gold bg-[#121212] border-border rounded focus:ring-sunshine-gold focus:ring-1 cursor-pointer accent-sunshine-gold"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className="h-11 px-5 rounded-xl bg-card border border-border text-xs font-bold text-sunshine-textNearWhite hover:border-sunshine-gold transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-xs tracking-wide shadow-md shadow-sunshine-gold/10 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/20 transition-all duration-300 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Note</span>
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

export default AdminDashboardPage;
