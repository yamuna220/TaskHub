import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, UserPlus, MoreVertical, Mail, Calendar, Settings2, Plus, Loader2 } from 'lucide-react';
import { TeamMember } from '../types';
import { api } from '../lib/api';

export default function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await api.getUsers();
        const mappedMembers = data.map((user: any) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
          email: user.email,
          lastActive: user.is_active ? 'Online Now' : 'Offline',
          activeTasks: user.active_task_count || 0,
          avatar: '',
          initials: (user.first_name[0] + user.last_name[0]).toUpperCase(),
          status: user.is_active ? 'online' : 'offline'
        }));
        setMembers(mappedMembers);
      } catch (err) {
        console.error('Failed to fetch team', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-wider text-primary font-bold mb-2">Workspace Members</p>
          <h3 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">Your High-Performance Team</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Manage permissions, roles, and monitor team workload across all active projects. 
            Administrators have elevated access to workspace settings and member auditing.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-xl">
          <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-sm font-medium text-primary">Grid View</button>
          <button className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">List View</button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map((member, i) => (
          <motion.div 
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group border border-transparent hover:border-outline-variant/15 flex flex-col relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {member.avatar ? (
                  <img 
                    alt={member.name} 
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm" 
                    src={member.avatar}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl uppercase tracking-tighter ${
                    member.id === '1' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary text-on-primary'
                  }`}>
                    {member.initials}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 tracking-tight text-lg">{member.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    member.role === 'Product Owner' ? 'bg-tertiary-container/10 text-tertiary-container' :
                    member.role === 'Lead Designer' ? 'bg-secondary-container text-on-secondary-container' :
                    'bg-primary-fixed text-on-primary-fixed-variant'
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-primary transition-colors p-1">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail size={16} />
                {member.email}
              </div>
              <div className={`flex items-center gap-3 text-sm ${member.status === 'online' ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                {member.status === 'online' ? <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" /> : <Calendar size={16} />}
                Last active: {member.lastActive}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Active Tasks</p>
                <p className="text-xl font-extrabold text-slate-900">{member.activeTasks}</p>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-slate-200 overflow-hidden">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBs8pwiKWMPThXdQ8oQ6QMnh7aFwHsCVC5pRpcxjg3ueGNI1FZSLmBjTQ9gOdmCBFb9Ln-UVPPnV-Eg-wfo2qRZPdkmim1Mt9FLsTdXdwaol3BgqSaAcbcrtfD4166uz-Jcbc6HStnPVD_fL6c3aD9SeY-NgkH0Opz69ogZ7yF-Mb8II-UTXnPY56hLwQ0hU1GOzqGfnjO5o8JQJEyFrVh2eaIiUFc1DU9unZNyP_YuhRUaLGxcZcef_UljsGFG2sJSrHwFsFojapx" referrerPolicy="no-referrer" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-slate-300 flex items-center justify-center text-[10px] font-bold">+2</div>
              </div>
            </div>

            <button className="mt-auto w-full py-2.5 rounded-lg text-sm font-bold bg-surface-container-high text-on-surface-variant hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              <Settings2 size={16} />
              Manage
            </button>
          </motion.div>
        ))}

        {/* Add Member Card */}
        <button className="bg-surface-container-low border-2 border-dashed border-outline-variant/30 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 group hover:bg-white hover:border-primary transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus size={32} className="text-slate-400 group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700 tracking-tight">Add New Member</h4>
            <p className="text-xs text-slate-500 mt-1">Expand your team capacity</p>
          </div>
        </button>
      </div>

      {/* Stats Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-surface-container-low rounded-2xl p-8 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-xl font-bold tracking-tight mb-2">Resource Allocation</h4>
            <p className="text-on-surface-variant text-sm mb-8">Average task distribution across members</p>
            <div className="flex items-end gap-6 h-48">
              {[
                { label: 'Product', val: 65, color: 'bg-primary' },
                { label: 'Design', val: 82, color: 'bg-secondary' },
                { label: 'Engineering', val: 40, color: 'bg-tertiary' },
                { label: 'Support', val: 55, color: 'bg-primary-container' }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className={`w-full ${bar.color} rounded-t-lg relative transition-all duration-500`} style={{ height: `${bar.val}%` }}>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{bar.val}%</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-primary rounded-2xl p-8 text-on-primary flex flex-col justify-between shadow-lg shadow-primary/20">
          <div>
            <UserPlus size={40} className="mb-4 opacity-80" />
            <h4 className="text-lg font-bold">Team Strength</h4>
            <p className="text-indigo-100 text-xs mt-2">Active seats: 12 / 20</p>
          </div>
          <div className="mt-8">
            <p className="text-3xl font-extrabold">Highly Stable</p>
            <p className="text-indigo-100 text-[10px] uppercase tracking-widest mt-2 font-semibold">98% Satisfaction Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
