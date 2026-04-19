import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, AlertCircle, CheckCircle2, Loader2, Tag, User, AlignLeft, Briefcase } from 'lucide-react';
import { api } from '../lib/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  user: any;
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated, user }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [team, setTeam] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: '',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await api.getUsers();
        setTeam(data);
      } catch (err) {
        console.error('Failed to load team', err);
      }
    };
    fetchTeam();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createTask({
        ...formData,
        organization_id: user.organizationId
      });
      onTaskCreated();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assigned_to: '',
        due_date: new Date().toISOString().split('T')[0],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-surface-container-low">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Briefcase className="text-primary" size={18} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Create New Task</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-sm font-medium">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Task Title</label>
                  <input
                    required
                    autoFocus
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-slate-900 font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="What needs to be done?"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                  <div className="relative group">
                    <div className="absolute top-3 left-4">
                       <AlignLeft className="text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    </div>
                    <textarea
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="Add more details..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Priority</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Tag className="text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                      </div>
                      <select
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Assign To</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <User className="text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                      </div>
                      <select
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        value={formData.assigned_to}
                        onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {team.map(m => (
                          <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Due Date</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Calendar className="text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                      </div>
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.due_date}
                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Create Task</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
