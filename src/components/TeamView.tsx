import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, UserPlus, MoreVertical, Mail, Calendar, Settings2, Plus, Loader2 } from 'lucide-react';
import { TeamMember } from '../types';
import { api } from '../lib/api';

export default function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'member' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Invite Modal Code ... (same as before) */}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-wider text-primary font-bold mb-2">Workspace Members</p>
          <h3 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">Your High-Performance Team</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Manage permissions, roles, and monitor team workload across all active projects.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Find member..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border-none rounded-xl text-xs w-48 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Plus size={18} className={viewMode === 'grid' ? '' : 'opacity-50'} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings2 size={18} className={viewMode === 'list' ? '' : 'opacity-50'} />
          </button>
        </div>
      </div>

      {/* Team Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member, i) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-2xl custom-shadow hover:shadow-xl transition-all group border border-transparent hover:border-primary/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl uppercase tracking-tighter bg-primary text-on-primary shadow-lg shadow-primary/20`}>
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 tracking-tight text-lg">{member.name}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase`}>
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
                <div className={`flex items-center gap-3 text-sm ${member.status === 'online' ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                  {member.status === 'online' ? <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" /> : <Calendar size={16} />}
                  {member.lastActive}
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Queue Size</p>
                  <p className="text-xl font-extrabold text-slate-900">{member.activeTasks} Tasks</p>
                </div>
              </div>

              <button 
                onClick={() => alert(`Opening management panel for ${member.name}`)}
                className="w-full py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Settings2 size={16} />
                Manage Access
              </button>
            </motion.div>
          ))}

          {/* Add Member Card */}
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-surface-container-low border-2 border-dashed border-outline-variant/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 group hover:bg-white hover:border-primary transition-all duration-300 min-h-[250px]"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <UserPlus size={32} className="text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-slate-700 tracking-tight">Expand Workspace</h4>
              <p className="text-xs text-slate-500 mt-1">Generate a join link</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl custom-shadow overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold">{member.initials}</div>
                      <span className="font-bold text-slate-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-500">{member.email}</td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded uppercase">{member.role}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-bold ${member.status === 'online' ? 'text-green-600' : 'text-slate-400'} uppercase tracking-tight`}>
                      {member.status === 'online' ? '● Online' : '○ Offline'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <Settings2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
