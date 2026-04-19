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
  Send
} from 'lucide-react';
import { Task } from '../types';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
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
                  <Paperclip size={14} />
                  Attachments (2)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
                      <Tag size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">schema_v2.pdf</p>
                      <p className="text-[10px] text-slate-400">2.4 MB</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <Tag size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">mockups.fig</p>
                      <p className="text-[10px] text-slate-400">14.8 MB</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MessageSquare size={14} />
                  Comments (3)
                </h3>
                <div className="space-y-6">
                  {[
                    { user: 'Sarah K.', time: '2 hours ago', text: 'I have updated the isolation logic to include the new edge cases we discussed in the standup.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdaEcczLA0VbO3o7FoJi4CSZZbDJZ2u55lUJEKPk78LDF4Xonvi29yt4_bd7RK8aZtAlKMXkTiNSwnc4N0lxsNKExCil2xcVqEpBhKOAD7bXHGLDJ112t7K_PNGuCUnnMc5A4bvg6V_GlJ9wxSJQhwMYFdHBZjV5O0xNc6s-OytPeyZd8ZLvKeQbl04BwcJL8Zg8ss81N1sQbSKAUqj8OtrEMZ-QotIQ7YqlhjJpulcMZyIMGHoYCrGg5CCLgwzByLBdudQ9-RlI4b' },
                    { user: 'Alex Rivera', time: '1 hour ago', text: 'Looks good, I will review the PR shortly.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFqDzu6LyLIbT0fPTQP8Ovox64UgLINFPGfR2oP_iXaguZ9BRSeR1RUiaBIDF7O0SlK_TWoXS-_97EOc2bmq7nC9h037NWodpkr-kw9ESVfcfl1hiUrjv3qJfgE4CwaB4tHJR4czKul9CtmMtMXHJ5WtW3HikzA-lIBDV9_HNR3pOkLRfsI8AJ0PgUbU_a6sli-O1cBX_0c9noqf8_VtGxRlzXhD2tm0DN1YhrZQWIOIJ6MmfAmmWd_CHeEuKggXIokisp304D041t' }
                  ].map((comment, i) => (
                    <div key={i} className="flex gap-4">
                      <img alt={comment.user} className="w-8 h-8 rounded-full object-cover" src={comment.avatar} referrerPolicy="no-referrer" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">{comment.user}</span>
                          <span className="text-[10px] text-slate-400">{comment.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative mt-6">
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-2xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                    placeholder="Write a comment..." 
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all">
                    <Send size={16} />
                  </button>
                </div>
              </section>
            </div>

            {/* Sidebar info */}
            <div className="flex-1 bg-surface-container-low/20 p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</label>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    task.status === 'In Progress' ? 'bg-indigo-50 border-indigo-100 text-primary' :
                    task.status === 'Review' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    task.status === 'Done' ? 'bg-green-50 border-green-100 text-green-700' :
                    'bg-white border-slate-100 text-slate-600'
                  }`}>
                    {task.status === 'Done' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
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
                    {task.assignee.avatar ? (
                      <img alt={task.assignee.name} className="w-8 h-8 rounded-lg object-cover" src={task.assignee.avatar} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {task.assignee.name[0]}
                      </div>
                    )}
                    <span className="text-sm font-bold text-slate-900">{task.assignee.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</label>
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-900">{task.dueDate}</span>
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
                    { action: 'Status changed to Review', time: '1h ago' },
                    { action: 'Added 2 attachments', time: '3h ago' },
                    { action: 'Task created', time: 'Yesterday' }
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
