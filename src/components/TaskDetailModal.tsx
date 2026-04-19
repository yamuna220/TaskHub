import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  MessageSquare, 
  Paperclip, 
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Send,
  Loader2
} from 'lucide-react';
import { Task } from '../types';
import { api } from '../lib/api';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    if (!task) return;
    setLoadingComments(true);
    try {
      const data = await api.getComments(task.id);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await api.addComment(task.id, newComment);
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-surface-container-low/30">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-widest">{task.id}</span>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-sm font-medium text-slate-500">{task.project}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <MoreVertical size={20} className="text-slate-400" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-[2] p-8 space-y-8 border-r border-slate-100">
              <section>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">{task.title}</h2>
                <p className="text-slate-600 leading-relaxed">
                  {task.description || "No description provided for this task. Please add details to help the assignee understand the requirements and scope of work."}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MessageSquare size={14} />
                  Comments ({comments.length})
                </h3>
                <div className="space-y-6">
                  {loadingComments ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-slate-300" />
                    </div>
                  ) : comments.length > 0 ? comments.map((comment, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {comment.first_name[0]}{comment.last_name ? comment.last_name[0] : ''}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">{comment.first_name} {comment.last_name}</span>
                          <span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none">{comment.content}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-slate-400 italic py-2">No comments yet. Be the first to start the conversation!</p>
                  )}
                </div>
                <form className="relative mt-6" onSubmit={handleSendComment}>
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-2xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                    placeholder="Write a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submitting}
                  />
                  <button 
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              </section>
            </div>

            {/* Sidebar info */}
            <div className="flex-1 bg-surface-container-low/20 p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</label>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    task.status === 'In Progress' || task.status === 'in_progress' ? 'bg-indigo-50 border-indigo-100 text-primary' :
                    task.status === 'Review' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    task.status === 'Done' || task.status === 'completed' ? 'bg-green-50 border-green-100 text-green-700' :
                    'bg-white border-slate-100 text-slate-600'
                  }`}>
                    {task.status === 'Done' || task.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    <span className="text-sm font-bold">{task.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</label>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    task.priority === 'High' ? 'bg-red-50 border-red-100 text-error' :
                    task.priority === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    'bg-white border-slate-100 text-slate-600'
                  }`}>
                    <AlertCircle size={16} />
                    <span className="text-sm font-bold">{task.priority}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assignee</label>
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {task.assignee?.name?.[0] || 'U'}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{task.assignee?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</label>
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-900">{task.dueDate || 'No date set'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <History size={14} />
                  Recent Activity
                </h4>
                <div className="space-y-4">
                  {[
                    { action: 'Task viewed', time: 'Just now' },
                    { action: 'Created', time: task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A' }
                  ].map((act, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-slate-700">{act.action}</p>
                        <p className="text-[10px] text-slate-400">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
