import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  MoreVertical, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
import { Task } from '../types';
import { api } from '../lib/api';

interface TasksViewProps {
  onTaskClick: (task: Task) => void;
  onNewTask: () => void;
  user: any;
}

export default function TasksView({ onTaskClick, onNewTask, user }: TasksViewProps) {
  const canCreate = user?.role === 'admin' || user?.role === 'member';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        // Map backend fields to frontend types if necessary
        const mappedTasks = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          project: 'Organization Task', 
          status: t.status === 'in_progress' || t.status === 'In Progress' ? 'In Progress' : (t.status === 'completed' || t.status === 'Done' ? 'Done' : 'To Do'),
          priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
          assignee: {
            name: 'Assigned User', 
            avatar: ''
          },
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date',
          description: t.description,
          created_at: t.created_at
        }));
        setTasks(mappedTasks);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all duration-200 ${
              viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <List size={18} />
            List
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all duration-200 ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <LayoutGrid size={18} />
            Board
          </button>
        </div>

        <div className="flex items-center gap-3">
          {canCreate && (
            <button 
              onClick={onNewTask}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-br from-primary to-primary-container rounded-lg editorial-shadow active:scale-[0.97] transition-all duration-200"
            >
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl editorial-shadow overflow-hidden border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Task Title</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Priority</th>
                <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Due Date</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {tasks.map((task, idx) => (
                <tr 
                  key={task.id} 
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-surface-container-low/30 transition-all duration-200 group cursor-pointer"
                >
                  <td className="px-6 py-5 text-xs text-slate-400 font-bold">{idx + 1}</td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{task.title}</span>
                      <span className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[300px]">{task.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      task.status === 'In Progress' ? 'bg-secondary-container text-on-secondary-container' :
                      task.status === 'Review' ? 'bg-amber-100 text-amber-800' :
                      task.status === 'Done' ? 'bg-green-100 text-green-800' :
                      'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className={`flex items-center gap-1.5 ${
                      task.priority === 'High' ? 'text-error' :
                      task.priority === 'Medium' ? 'text-amber-600' :
                      'text-slate-400'
                    }`}>
                      <AlertCircle size={14} />
                      <span className="text-xs font-bold uppercase tracking-tighter">{task.priority}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm text-on-surface-variant font-medium">{task.dueDate}</td>
                  <td className="px-6 py-5 text-right">
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic">No tasks found. Get started by creating one!</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tasks.map((task) => (
            <motion.div
              layoutId={task.id}
              key={task.id}
              onClick={() => onTaskClick(task)}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 editorial-shadow cursor-pointer group hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                  task.priority === 'High' ? 'bg-error/10 text-error' :
                  task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {task.priority}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                   task.status === 'In Progress' ? 'bg-primary' :
                   task.status === 'Done' ? 'bg-green-500' :
                   'bg-slate-300'
                }`}></span>
              </div>
              <h4 className="font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{task.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-6">{task.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {task.assignee?.name?.[0] || 'U'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{task.dueDate}</span>
                 </div>
                 <div className="flex items-center gap-1 text-slate-300">
                    <MessageSquare size={12} />
                    <span className="text-[10px] font-bold">0</span>
                 </div>
              </div>
            </motion.div>
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 italic">No tasks found.</div>
          )}
        </div>
      )}
    </div>
  );
    </div>
  );
}
