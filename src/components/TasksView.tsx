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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        // Map backend fields to frontend types if necessary
        const mappedTasks = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          project: 'Organization Task', // Backend doesn't have project name yet
          status: t.status === 'in_progress' ? 'In Progress' : (t.status === 'completed' ? 'Done' : 'To Do'),
          priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
          assignee: {
            name: 'Assigned User', // Need to fetch user details or include in join
            avatar: ''
          },
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date',
          description: t.description
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
          <button className="px-4 py-2 text-sm font-semibold bg-white shadow-sm rounded-md text-primary flex items-center gap-2 transition-all duration-200">
            <List size={18} />
            List
          </button>
          <button className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-md flex items-center gap-2 transition-all duration-200">
            <LayoutGrid size={18} />
            Board
          </button>
          <button className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-md flex items-center gap-2 transition-all duration-200">
            <CalendarIcon size={18} />
            Calendar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-all duration-200">
            <Filter size={18} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-all duration-200">
            <ArrowUpDown size={18} />
            Sort
          </button>
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

      {/* Table */}
      <div className="bg-white rounded-xl editorial-shadow overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-4 w-12">
                <input type="checkbox" className="rounded text-primary focus:ring-primary/20 border-outline-variant" />
              </th>
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Task Title</th>
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Priority</th>
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Assignee</th>
              <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Due Date</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                onClick={() => onTaskClick(task)}
                className="hover:bg-surface-container-low/30 transition-all duration-200 group cursor-pointer"
              >
                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded text-primary focus:ring-primary/20 border-outline-variant" />
                </td>
                <td className="px-4 py-5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{task.title}</span>
                    <span className="text-xs text-on-surface-variant mt-0.5">Project: {task.project}</span>
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
                    task.priority === 'Medium' ? 'text-tertiary-container' :
                    'text-slate-400'
                  }`}>
                    <AlertCircle size={14} />
                    <span className="text-xs font-bold uppercase tracking-tighter">{task.priority}</span>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-2">
                    {task.assignee.avatar ? (
                      <img 
                        alt={task.assignee.name} 
                        className="w-7 h-7 rounded-full ring-2 ring-white bg-slate-100 object-cover" 
                        src={task.assignee.avatar}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant border-2 border-white">
                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-600">{task.assignee.name}</span>
                  </div>
                </td>
                <td className="px-4 py-5 text-sm text-on-surface-variant font-medium">{task.dueDate}</td>
                <td className="px-6 py-5 text-right">
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-container-high rounded-md transition-all duration-200">
                    <MoreVertical size={18} className="text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
