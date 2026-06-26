import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Smile,
  Save,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Code
} from 'lucide-react';
import { JournalEntry } from '../types';
import api from '../utils/api';

// Mood Configurations
const moodsConfig = {
  Calm: { emoji: '🧘', label: 'Calm', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Happy: { emoji: '☀️', label: 'Happy', bg: 'bg-[#F5C518]/10', text: 'text-[#F5C518]', border: 'border-[#F5C518]/20' },
  Energetic: { emoji: '⚡', label: 'Energetic', bg: 'bg-[#FF8C42]/10', text: 'text-[#FF8C42]', border: 'border-[#FF8C42]/20' },
  Tired: { emoji: '🥱', label: 'Tired', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  Sad: { emoji: '🌧️', label: 'Sad', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Anxious: { emoji: '😰', label: 'Anxious', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Grateful: { emoji: '❤️', label: 'Grateful', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor form states
  const [editTitle, setEditTitle] = useState('');
  const [editMood, setEditMood] = useState<keyof typeof moodsConfig>('Calm');

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[220px] max-h-[360px] overflow-y-auto pr-1 text-sm leading-relaxed font-serif text-sunshine-textNearWhite prose prose-invert',
      },
    },
  });

  // Load entries from backend API
  useEffect(() => {
    api.get('/journal')
      .then((res) => {
        setEntries(res.data);
        if (res.data.length > 0) {
          setSelectedId(res.data[0].id);
        }
      })
      .catch((err) => console.error('Failed to fetch journal entries:', err));
  }, []);

  // Sync editor content when selected entry changes (but only if not editing)
  const selectedEntry = entries.find((e) => e.id === selectedId);
  useEffect(() => {
    if (selectedEntry && editor && !isEditing) {
      editor.commands.setContent(selectedEntry.content);
    }
  }, [selectedId, selectedEntry, editor, isEditing]);

  const saveEntriesToStorage = (updated: JournalEntry[]) => {
    setEntries(updated);
    localStorage.setItem('sunshine_journal_entries', JSON.stringify(updated));
  };

  // Toggle edit mode
  const handleStartEdit = () => {
    if (!selectedEntry) return;
    setEditTitle(selectedEntry.title);
    setEditMood(selectedEntry.mood as any);
    editor?.commands.setContent(selectedEntry.content);
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedEntry) {
      editor?.commands.setContent(selectedEntry.content);
    }
  };

  // Save entry on backend (Create or Update)
  const handleSaveEntry = async () => {
    if (!editor || !editTitle.trim()) return;
    const contentHtml = editor.getHTML();

    try {
      if (selectedId && entries.some(e => e.id === selectedId)) {
        // Update
        const res = await api.put(`/journal/${selectedId}`, {
          title: editTitle.trim(),
          content: contentHtml,
          mood: editMood,
        });
        setEntries(entries.map((e) => (e.id === selectedId ? res.data : e)));
      } else {
        // Create new
        const res = await api.post('/journal', {
          title: editTitle.trim(),
          content: contentHtml,
          mood: editMood,
        });
        setEntries([res.data, ...entries]);
        setSelectedId(res.data.id);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save journal entry:', err);
    }
  };

  // Create empty new entry
  const handleCreateNew = () => {
    setSelectedId(''); // Clear selected id to represent new entry
    setEditTitle('');
    setEditMood('Calm');
    editor?.commands.setContent('<p>Start writing your thoughts here...</p>');
    setIsEditing(true);
  };

  // Delete entry on backend
  const handleDeleteEntry = async (id: string) => {
    try {
      await api.delete(`/journal/${id}`);
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      if (updated.length > 0) {
        setSelectedId(updated[0].id);
      } else {
        setSelectedId('');
      }
    } catch (err) {
      console.error('Failed to delete journal entry:', err);
    }
  };

  // Excerpt generator (strips html and takes 2 lines)
  const getExcerpt = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    return text.slice(0, 80) + (text.length > 80 ? '...' : '');
  };

  // Filter entry list
  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto select-none pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
            Mood Journal
          </h1>
          <p className="text-xs text-sunshine-textMuted mt-0.5">
            Capture thoughts, log emotional moods, and format notes with rich text tools.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleCreateNew}
            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sunshine-gold/20 transition-all duration-300 cursor-pointer"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
        )}
      </div>

      {/* Split Pane Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Entries List (1 Column) */}
        <div className="lg:col-span-1 bg-card border border-border/60 rounded-3xl p-5 space-y-4 flex flex-col max-h-[640px]">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journal entries..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:border-sunshine-gold transition-all duration-200"
            />
          </div>

          {/* List viewport */}
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin max-h-[480px]">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => {
                const isSelected = entry.id === selectedId;
                const moodConfig = moodsConfig[entry.mood as keyof typeof moodsConfig] || moodsConfig.Calm;
                
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      if (isEditing) {
                        if (!confirm('Discard unsaved changes?')) return;
                        setIsEditing(false);
                      }
                      setSelectedId(entry.id);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border flex flex-col gap-2 relative transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#141414] border-sunshine-gold shadow-md shadow-sunshine-gold/5'
                        : 'bg-[#141414]/40 border-border/30 hover:border-border/80'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 w-full">
                      <span className="text-[10px] text-sunshine-textMuted font-bold uppercase">
                        {new Date(entry.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {/* Mood label */}
                      <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border ${moodConfig.bg} ${moodConfig.text} ${moodConfig.border}`}>
                        {moodConfig.emoji} {moodConfig.label}
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-sunshine-textNearWhite truncate pr-2">
                      {entry.title}
                    </h3>
                    <p className="text-[11px] text-sunshine-textMuted leading-relaxed line-clamp-2 pr-1">
                      {getExcerpt(entry.content)}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="py-20 text-center text-xs text-sunshine-textMuted flex flex-col items-center justify-center gap-2">
                <BookOpen size={36} className="text-sunshine-gold/30 animate-pulse" />
                <span>No entries found.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Entry Editor / Detail Viewer (2 Columns) */}
        <div className="lg:col-span-2 bg-card border border-border/60 rounded-3xl p-6 min-h-[520px] flex flex-col justify-between relative">
          <AnimatePresence mode="wait">
            {isEditing ? (
              // EDIT MODE PANEL
              <motion.div
                key="edit-pane"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 flex flex-col h-full"
              >
                {/* Editor Header: Title Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase">
                    Entry Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="E.g., Thoughts on a sunny afternoon"
                    className="w-full h-12 px-4 rounded-xl bg-[#121212] border border-border text-xs font-bold text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold"
                  />
                </div>

                {/* Mood Selector Grid */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase block">
                    Select Your Mood
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(moodsConfig).map(([key, config]) => {
                      const isSelected = editMood === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEditMood(key as any)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? `${config.bg} ${config.text} ${config.border} border-current`
                              : 'bg-[#121212] border-border text-sunshine-textMuted hover:text-sunshine-textNearWhite'
                          }`}
                        >
                          <span>{config.emoji}</span>
                          <span>{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tiptap Rich Text Editor & Toolbar */}
                <div className="space-y-2 pt-2 border-t border-border/30 flex-1 flex flex-col">
                  <label className="text-[10px] font-bold text-sunshine-textMuted tracking-wider uppercase">
                    Rich Text Editor
                  </label>
                  
                  {/* Rich Text Toolbar */}
                  {editor && (
                    <div className="flex flex-wrap gap-1 p-1.5 bg-[#121212] border border-border rounded-xl">
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('bold') ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Bold"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('italic') ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Italic"
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('heading', { level: 1 }) ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Heading 1"
                      >
                        <Heading1 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('heading', { level: 2 }) ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Heading 2"
                      >
                        <Heading2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('bulletList') ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Bullet List"
                      >
                        <List size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('orderedList') ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Numbered List"
                      >
                        <ListOrdered size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('blockquote') ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Blockquote"
                      >
                        <Quote size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`p-1.5 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] ${
                          editor.isActive('code') ? 'text-sunshine-gold bg-[#202020]' : ''
                        }`}
                        title="Code inline"
                      >
                        <Code size={14} />
                      </button>
                    </div>
                  )}

                  {/* Tiptap Editor Box */}
                  <div className="p-4 bg-[#121212] border border-border rounded-2xl flex-1 focus-within:border-sunshine-gold transition-colors">
                    <EditorContent editor={editor} />
                  </div>
                </div>

                {/* Editor Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30 bg-card">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-11 px-5 rounded-xl bg-card border border-border text-xs font-bold text-sunshine-textNearWhite hover:border-sunshine-gold transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEntry}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-xs tracking-wide shadow-md shadow-sunshine-gold/10 flex items-center justify-center gap-2 hover:shadow-sunshine-gold/20 transition-all duration-300 cursor-pointer"
                  >
                    <Save size={16} />
                    <span>Save Entry</span>
                  </button>
                </div>
              </motion.div>
            ) : selectedEntry ? (
              // READ-ONLY ENTRY VIEWER
              <motion.div
                key="view-pane"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 flex flex-col h-full justify-between"
              >
                <div className="space-y-4">
                  {/* Metadata Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
                    <div className="space-y-1">
                      {/* Formatted Date */}
                      <div className="flex items-center gap-2 text-xs font-bold text-sunshine-textMuted">
                        <Calendar size={14} className="text-sunshine-gold" />
                        <span>
                          {new Date(selectedEntry.createdAt).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Mood tag and Actions */}
                    <div className="flex items-center gap-3">
                      {/* Mood label */}
                      {(() => {
                        const moodConfig = moodsConfig[selectedEntry.mood as keyof typeof moodsConfig] || moodsConfig.Calm;
                        return (
                          <span className={`text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full border ${moodConfig.bg} ${moodConfig.text} ${moodConfig.border}`}>
                            {moodConfig.emoji} {moodConfig.label}
                          </span>
                        );
                      })()}

                      {/* Edit button */}
                      <button
                        onClick={handleStartEdit}
                        className="p-2 rounded-lg bg-[#141414] border border-border/60 text-sunshine-textMuted hover:text-sunshine-gold hover:border-sunshine-gold transition-colors"
                        title="Edit Entry"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteEntry(selectedEntry.id)}
                        className="p-2 rounded-lg bg-[#141414] border border-border/60 text-sunshine-textMuted hover:text-red-500 hover:border-red-500/20 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-black text-sunshine-textNearWhite font-serif leading-tight">
                    {selectedEntry.title}
                  </h2>

                  {/* Full entry text content area */}
                  <div
                    className="prose prose-invert max-w-none text-xs leading-relaxed font-serif text-sunshine-textNearWhite/90 pr-2 max-h-[360px] overflow-y-auto scrollbar-thin"
                    dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
                  ></div>
                </div>

                <div className="text-[10px] text-sunshine-textMuted pt-4 border-t border-border/30 flex items-center justify-between">
                  <span>Sunshine Journal persistence: local browser storage active.</span>
                  <span>LAST UPDATED: {new Date(selectedEntry.updatedAt).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ) : (
              // NO ENTRY SELECTED / EMPTY STATE
              <div className="py-32 text-center text-xs text-sunshine-textMuted flex flex-col items-center justify-center gap-3 h-full">
                <BookOpen size={44} className="text-sunshine-gold/30 animate-pulse" />
                <span>Select a journal entry from the left pane, or click "New Entry" to write down your thoughts!</span>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default JournalPage;
