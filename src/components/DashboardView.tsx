import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Plus,
  MoreVertical,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';

export default function DashboardView({ user, onNewTask }: { user: any, onNewTask: () => void }) {
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState([
    { label: 'Total Tasks', value: '0', change: '...', trend: 'neutral', icon: ListTodo, color: 'primary' },
    { label: 'Completed', value: '0', change: '...', trend: 'neutral', icon: CheckCircle2, color: 'green' },
    { label: 'In Progress', value: '0', change: '...', trend: 'neutral', icon: Clock, color: 'amber' },
    { label: 'Pending', value: '0', change: '...', trend: 'neutral', icon: AlertTriangle, color: 'error' },
  ]);
  const [kanbanColumns, setKanbanColumns] = useState([
    { title: 'To Do', count: 0, color: 'slate', tasks: [] },
    { title: 'In Progress', count: 0, color: 'amber', tasks: [] },
    { title: 'Done', count: 0, color: 'green', tasks: [] }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.getTasks();
        const tasks = Array.isArray(result) ? result : [];
        const total = tasks.length;
        
        const isDone = (s: string) => s?.toLowerCase() === 'done' || s?.toLowerCase() === 'completed';
        const isProgress = (s: string) => s?.toLowerCase().includes('progress');
        const isTodo = (s: string) => s?.toLowerCase() === 'pending' || s?.toLowerCase() === 'to do' || s?.toLowerCase() === 'todo';

        const completed = tasks.filter((t: any) => isDone(t.status)).length;
        const inProgress = tasks.filter((t: any) => isProgress(t.status)).length;
        const pending = tasks.filter((t: any) => isTodo(t.status)).length;

        setStats([
          { label: 'Total Tasks', value: total.toString(), change: 'Live', trend: 'neutral', icon: ListTodo, color: 'primary' },
          { label: 'Completed', value: completed.toString(), change: 'Live', trend: 'neutral', icon: CheckCircle2, color: 'green' },
          { label: 'In Progress', value: inProgress.toString(), change: 'Live', trend: 'neutral', icon: Clock, color: 'amber' },
          { label: 'Pending', value: pending.toString(), change: 'Live', trend: 'neutral', icon: AlertTriangle, color: 'error' },
        ]);

        // Dynamically update Kanban columns
        setKanbanColumns([
          { 
            title: 'To Do', 
            count: pending, 
            color: 'slate', 
            tasks: tasks.filter((t: any) => isTodo(t.status)) 
          },
          { 
            title: 'In Progress', 
            count: inProgress, 
            color: 'amber', 
            tasks: tasks.filter((t: any) => isProgress(t.status)) 
          },
          { 
            title: 'Done', 
            count: completed, 
            color: 'green', 
            tasks: tasks.filter((t: any) => isDone(t.status)) 
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const activity: any[] = [];

  return (
    <div className="p-8 space-y-8">
      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl custom-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'green' ? 'bg-green-500/10 text-green-600' :
                stat.color === 'amber' ? 'bg-amber-500/10 text-amber-600' :
                'bg-error/10 text-error'
              }`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' :
                stat.trend === 'down' ? 'bg-error-container text-error' :
                'text-slate-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold tracking-tight">{stat.value}</span>
              <div className="flex-1 h-8 mb-1">
                <div className={`w-full h-full bg-${stat.color === 'primary' ? 'primary' : stat.color === 'error' ? 'error' : stat.color + '-500'}/5 rounded flex items-end gap-0.5 p-0.5`}>
                  {[30, 50, 80, 60].map((h, j) => (
                    <div key={j} className={`w-1/4 bg-${stat.color === 'primary' ? 'primary' : stat.color === 'error' ? 'error' : stat.color + '-500'} rounded-t-sm`} style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Kanban Preview */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900">My Tasks</h3>
              <p className="text-sm text-slate-500">Overview of your current sprint</p>
            </div>
            <button className="text-primary font-semibold text-sm hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kanbanColumns.map((col, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className={`w-2 h-2 rounded-full bg-${col.color === 'slate' ? 'slate-400' : col.color + '-500'}`}></div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{col.title}</span>
                  <span className="ml-auto bg-slate-200 text-[10px] px-2 py-0.5 rounded-full text-slate-600">{col.count}</span>
                </div>

                {col.tasks.length > 0 ? col.tasks.map((task: any, j: number) => (
                  <motion.div 
                    key={j}
                    whileHover={{ y: -2 }}
                    className={`bg-white p-4 rounded-xl border border-transparent hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing ${
                      task.urgent ? 'custom-shadow border-l-4 border-amber-500' : 'bg-surface-container-low'
                    } ${task.done ? 'opacity-60 grayscale-[0.5]' : ''}`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className={`w-2 h-2 rounded-full ${task.urgent ? 'bg-error' : 'bg-primary'}`}></span>
                      <span className="text-[10px] font-bold text-slate-400">{task.id}</span>
                    </div>
                    <p className={`text-sm font-semibold mb-4 leading-tight ${task.done ? 'line-through' : ''}`}>{task.title}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {task.avatar && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img alt="User" className="w-full h-full object-cover" src={task.avatar} referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] flex items-center gap-1 ${task.urgent ? 'text-error font-bold' : 'text-slate-500'}`}>
                        {task.done ? <CheckCircle2 size={12} className="text-green-600" /> : <Calendar size={12} />}
                        {task.date}
                      </span>
                    </div>
                  </motion.div>
                )) : (
                  <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center bg-slate-50/50">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Tasks</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Activity Feed */}
        <section className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xl font-bold text-slate-900">Team Activity</h3>
          </div>
          <div className="bg-white p-6 rounded-xl space-y-6 relative overflow-hidden border border-slate-100">
            <div className="absolute left-8 top-8 bottom-8 w-px bg-slate-100"></div>
            {activity.length > 0 ? activity.map((item, i) => (
              <div key={i} className="relative flex gap-4">
                <div className={`z-10 w-4 h-4 mt-1.5 -ml-2 rounded-full border-2 border-white ${
                  item.color === 'primary' ? 'bg-primary' :
                  item.color === 'amber' ? 'bg-amber-500' :
                  item.color === 'error' ? 'bg-error' :
                  'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-bold text-slate-900">{item.user}</span> {item.action} <span className="text-primary italic">{item.target}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{item.time}</p>
                </div>
                <item.icon size={16} className={`text-${item.color === 'primary' ? 'primary' : item.color === 'error' ? 'error' : item.color + '-400'}`} />
              </div>
            )) : (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm italic">No recent activity found.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Permissions Matrix */}
      <section className="mt-8">
        <div className="bg-white rounded-xl custom-shadow overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Permissions Matrix</h3>
              <p className="text-sm text-slate-500">Access control overview by user role</p>
            </div>
            {isAdmin && (
              <button className="bg-primary/5 text-primary px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-primary/10">Edit Roles</button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Capability</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-primary uppercase tracking-widest text-center">Admin</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Member</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Guest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Create New Tasks', admin: true, member: true, guest: false },
                  { name: 'Manage Team Members', admin: true, member: false, guest: false },
                  { name: 'Export System Audit Logs', admin: true, member: false, guest: false },
                  { name: 'Edit Project Settings', admin: true, member: 'info', guest: false },
                  { name: 'View Dashboards', admin: true, member: true, guest: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{row.name}</td>
                    <td className="px-6 py-4 text-center">
                      {row.admin === true ? <CheckCircle2 size={18} className="text-green-500 mx-auto" /> : <AlertTriangle size={18} className="text-error mx-auto" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.member === true ? <CheckCircle2 size={18} className="text-green-500 mx-auto" /> : 
                       row.member === 'info' ? <Clock size={18} className="text-amber-500 mx-auto" /> :
                       <AlertTriangle size={18} className="text-error mx-auto" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.guest === true ? <CheckCircle2 size={18} className="text-green-500 mx-auto" /> : <AlertTriangle size={18} className="text-error mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAB */}
      {isAdmin && (
        <button 
          onClick={onNewTask}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl custom-shadow flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
