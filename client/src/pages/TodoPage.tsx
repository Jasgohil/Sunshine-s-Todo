import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Circle,
  CheckCircle2,
  Calendar as CalendarIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Edit2,
  FolderTree,
  AlertTriangle
} from 'lucide-react';
import { Task, Subtask } from '../types';
import api from '../utils/api';

// Extend Task type locally to support inline subtasks array
interface ExtendedTask extends Task {
  subtasks?: Subtask[];
}

// Zod validation schema for Task creation
const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  dueDate: z.string().optional(),
  subtasks: z.array(z.object({
    title: z.string().min(1, 'Subtask title cannot be empty'),
  })).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const TodoPage: React.FC = () => {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);

  // React Hook Form for Task Modal
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      subtasks: [],
    },
  });

  // Dynamic field array for subtasks in modal
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subtasks',
  });

  // Load tasks from backend API
  useEffect(() => {
    api.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch((err) => console.error('Failed to fetch tasks:', err));
  }, []);

  // Toggle main task completion
  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'active' : 'completed';
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  // Toggle subtask completion
  const toggleSubtaskStatus = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks?.map((sub) => {
      if (sub.id === subtaskId) {
        return {
          ...sub,
          status: (sub.status === 'completed' ? 'active' : 'completed') as 'active' | 'completed',
        };
      }
      return sub;
    }) || [];

    try {
      const res = await api.put(`/tasks/${taskId}`, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        subtasks: updatedSubtasks,
      });
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Failed to toggle subtask status:', err);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Expand / collapse task tree
  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingTask(null);
    reset({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: [],
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (task: ExtendedTask) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || '',
      subtasks: task.subtasks?.map(sub => ({ title: sub.title })) || [],
    });
    setIsModalOpen(true);
  };

  // Submit handler (Add or Edit)
  const onSubmit = async (data: TaskFormValues) => {
    try {
      if (editingTask) {
        // Edit mode
        const res = await api.put(`/tasks/${editingTask.id}`, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate,
          subtasks: data.subtasks,
        });
        setTasks(tasks.map((t) => (t.id === editingTask.id ? res.data : t)));
      } else {
        // Add mode
        const res = await api.post('/tasks', {
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate,
          subtasks: data.subtasks,
        });
        setTasks([res.data, ...tasks]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return task.status === 'active';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-sunshine-textNearWhite tracking-tight">
            Tasks & Checklists
          </h1>
          <p className="text-xs text-sunshine-textMuted mt-0.5">
            Organize work items into expandable subtask trees.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-sunshine-gold to-sunshine-orange text-sunshine-darkBg font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sunshine-gold/20 transition-all duration-300 cursor-pointer"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#141414] rounded-xl border border-border/40">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-150 cursor-pointer ${
                filter === tab
                  ? 'bg-card text-sunshine-gold border border-border/60 shadow'
                  : 'text-sunshine-textMuted hover:text-sunshine-textNearWhite'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sunshine-textMuted text-xs font-medium">
          <SlidersHorizontal size={14} />
          <span>Active: {tasks.filter(t => t.status === 'active').length}</span>
        </div>
      </div>

      {/* Task List container */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const subtasks = task.subtasks || [];
              const totalSub = subtasks.length;
              const completedSub = subtasks.filter(s => s.status === 'completed').length;
              const progress = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;
              const isExpanded = expandedTasks[task.id] || false;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] as any }}
                  className={`rounded-2xl border transition-all duration-300 ${
                    task.status === 'completed'
                      ? 'bg-card/30 border-border/30 opacity-75'
                      : 'bg-card border-border/80 hover:border-sunshine-gold/20'
                  }`}
                >
                  {/* Task Header info row */}
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Checkbox button */}
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-1 flex-shrink-0 transition-colors duration-150 ${
                          task.status === 'completed' ? 'text-green-500' : 'text-sunshine-textMuted hover:text-sunshine-gold'
                        }`}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3
                            className={`text-sm font-bold text-sunshine-textNearWhite truncate leading-snug ${
                              task.status === 'completed' ? 'line-through text-sunshine-textMuted' : ''
                            }`}
                          >
                            {task.title}
                          </h3>
                          
                          {/* Priority badge */}
                          <span
                            className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                              task.priority === 'high'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : task.priority === 'medium'
                                ? 'bg-sunshine-orange/10 text-sunshine-orange border-sunshine-orange/20'
                                : 'bg-sunshine-gold/10 text-sunshine-gold border-sunshine-gold/20'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p
                            className={`text-xs text-sunshine-textMuted leading-relaxed max-w-2xl ${
                              task.status === 'completed' ? 'line-through' : ''
                            }`}
                          >
                            {task.description}
                          </p>
                        )}

                        {/* Date and Subtask Progress badge */}
                        <div className="flex items-center gap-3 pt-2 text-[10px] text-sunshine-textMuted font-bold">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={12} className="text-sunshine-gold" />
                              <span>DUE: {task.dueDate}</span>
                            </div>
                          )}

                          {totalSub > 0 && (
                            <div className="flex items-center gap-1 text-sunshine-orange">
                              <FolderTree size={12} />
                              <span>SUBTASKS: {completedSub}/{totalSub} ({progress}%)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-2 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] transition-colors duration-150"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 rounded-lg text-sunshine-textMuted hover:text-red-500 hover:bg-red-500/10 transition-colors duration-150"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Expand / Tree Toggle */}
                      {totalSub > 0 && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="p-2 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] transition-colors duration-150"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subtask Tree Expansion section */}
                  {totalSub > 0 && isExpanded && (
                    <div className="border-t border-border/30 bg-[#0E0E0E]/40 px-5 py-4 rounded-b-2xl space-y-3">
                      {/* Subtask progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-sunshine-textMuted">
                          <span>SUBTASK CHECKLIST</span>
                          <span className="text-sunshine-orange">{progress}% COMPLETE</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#1A1A1A] overflow-hidden border border-border/20">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sunshine-gold to-sunshine-orange transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Checklist nodes */}
                      <div className="pl-6 space-y-2.5 relative border-l border-border/40 ml-2.5">
                        {subtasks.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between group/sub">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Left connection branch dot */}
                              <div className="absolute left-[-5px] w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-border/60"></div>
                              
                              <button
                                onClick={() => toggleSubtaskStatus(task.id, sub.id)}
                                className={`text-[10px] transition-colors duration-150 ${
                                  sub.status === 'completed' ? 'text-green-500' : 'text-sunshine-textMuted hover:text-sunshine-gold'
                                }`}
                              >
                                {sub.status === 'completed' ? (
                                  <CheckCircle2 size={16} />
                                ) : (
                                  <Circle size={16} />
                                )}
                              </button>
                              
                              <span
                                className={`text-xs font-medium text-sunshine-textNearWhite truncate leading-none ${
                                  sub.status === 'completed' ? 'line-through text-sunshine-textMuted' : ''
                                }`}
                              >
                                {sub.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="py-20 text-center text-xs text-sunshine-textMuted flex flex-col items-center justify-center gap-3 border border-dashed border-border/60 rounded-3xl bg-card/20">
              <FolderTree size={44} className="text-sunshine-gold/30 animate-pulse" />
              <span>No tasks found here. Create a new task to begin!</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Creation / Editing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Modal Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#000]/80 backdrop-blur-sm z-40"
            ></motion.div>

            {/* Modal Window box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] as any }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90svh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-[#121212]">
                <h2 className="text-sm font-bold text-sunshine-textNearWhite uppercase tracking-wide">
                  {editingTask ? 'Edit Task' : 'New Workspace Task'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-sunshine-textMuted hover:text-sunshine-gold hover:bg-[#202020] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form body container */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Review project design"
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
                  <textarea
                    rows={2.5}
                    placeholder="Enter short details about this task..."
                    {...register('description')}
                    className="w-full px-4 py-3 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:border-sunshine-gold resize-none"
                  />
                </div>

                {/* Grid for Priority and Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                      Priority Level
                    </label>
                    <select
                      {...register('priority')}
                      className="w-full h-11 px-3 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                      Due Date
                    </label>
                    <input
                      type="date"
                      {...register('dueDate')}
                      className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold cursor-pointer"
                    />
                  </div>
                </div>

                {/* Subtask Section */}
                <div className="space-y-3 pt-3 border-t border-border/30">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-sunshine-textNearWhite tracking-wider uppercase">
                      Subtask Checklist
                    </label>
                    <button
                      type="button"
                      onClick={() => append({ title: '' })}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-sunshine-gold hover:text-sunshine-orange transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Subtask</span>
                    </button>
                  </div>

                  {/* Dynamic subtask input rows */}
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-sunshine-orange/60"></div>
                        <input
                          type="text"
                          placeholder={`Subtask #${index + 1} description`}
                          {...register(`subtasks.${index}.title` as const)}
                          className="flex-1 h-10 px-3.5 rounded-xl bg-[#121212] border border-border text-xs text-sunshine-textNearWhite focus:outline-none focus:border-sunshine-gold"
                        />
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-sunshine-textMuted hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {fields.length === 0 && (
                      <p className="text-[10px] text-sunshine-textMuted italic">
                        No subtasks added yet. Break this task into micro-steps to track progress.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30 bg-card">
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
                    {editingTask ? 'Save Changes' : 'Create Task'}
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

export default TodoPage;
