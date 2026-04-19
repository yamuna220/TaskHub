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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        const mappedTasks = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          project: 'Organization Task', 
          status: t.status?.toLowerCase().includes('progress') ? 'In Progress' : 
                  (t.status?.toLowerCase().includes('done') || t.status?.toLowerCase().includes('completed') ? 'Done' : 'To Do'),
          priority: t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1) || 'Medium',
          assignee: {
            name: t.assignee_name || 'Unassigned', 
            avatar: ''
          },
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date',
          description: t.description,
          created_at: t.created_at
        }));
        setTasks(mappedTasks);
      } catch (err: any) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-200 ${
                viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <List size={18} />
              List
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <LayoutGrid size={18} />
              Board
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canCreate && (
            <button 
              onClick={onNewTask}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container rounded-xl shadow-lg shadow-primary/20 active:scale-[0.97] transition-all duration-200"
            >
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl custom-shadow overflow-hidden border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 w-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Details</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task, idx) => (
                <tr 
                  key={task.id} 
                  onClick={() => onTaskClick(task)}
                  className="hover:bg-slate-50 transition-all duration-200 group cursor-pointer"
                >
                  <td className="px-8 py-5 text-xs text-slate-400 font-mono">{task.id.slice(0, 4)}</td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{task.title}</span>
                      <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                      task.status === 'In Progress' ? 'bg-indigo-50 text-primary' :
                      task.status === 'Done' ? 'bg-green-50 text-green-700' :
                      'bg-slate-100 text-slate-500'
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
                      <span className="text-[10px] font-bold uppercase">{task.priority}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="p-16 text-center text-slate-400 italic">No tasks found in this view.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTasks.map((task) => (
            <motion.div
              layoutId={task.id}
              key={task.id}
              onClick={() => onTaskClick(task)}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-2xl border border-transparent custom-shadow cursor-pointer group hover:border-primary/20 transition-all h-full flex flex-col"
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
                   task.status === 'In Progress' ? 'bg-primary animate-pulse' :
                   task.status === 'Done' ? 'bg-green-500' :
                   'bg-slate-300'
                }`}></span>
              </div>
              <h4 className="font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{task.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-3 mb-6 flex-grow">{task.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                      {task.assignee?.name?.[0] || 'U'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{task.dueDate}</span>
                 </div>
              </div>
            </motion.div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="col-span-full p-16 text-center text-slate-400 italic">No tasks found.</div>
          )}
        </div>
      )}
    </div>
  );
}
