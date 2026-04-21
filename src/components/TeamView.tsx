import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, MoreVertical, Mail, Settings2, Plus, Loader2, CheckCircle2, AlertCircle, History } from 'lucide-react';
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
  const [isSending, setIsSending] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'success' | 'mail-error' | 'error'>('idle');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await api.getUsers();
        const mappedMembers: TeamMember[] = data.map((u: any) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name || ''}`,
          role: u.role,
          email: u.email,
          status: u.is_active ? 'online' : 'offline',
          lastActive: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never',
          activeTasks: u.active_task_count || 0,
          initials: (u.first_name?.[0] || '') + (u.last_name?.[0] || ''),
          avatar: `https://i.pravatar.cc/150?u=${u.id}`
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

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setInviteStatus('idle');
    try {
      const res = await api.createInvitation(inviteData);
      const link = `${window.location.origin}/register?invite=${res.token}`;
      setGeneratedLink(link);
      
      if (res.mailSent) {
        setInviteStatus('success');
      } else {
        setInviteStatus('mail-error');
      }
    } catch (err) {
      console.error('Invite failed', err);
      setInviteStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      await api.updateUserRole(id, { role: newRole });
      setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
      setEditingMember(null);
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
    setActiveMenuId(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative"
      onClick={() => setActiveMenuId(null)}
    >
      {/* Manage Member Modal */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full custom-shadow relative"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">{editingMember.initials}</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Manage {editingMember.name}</h3>
                  <p className="text-slate-500 text-sm">{editingMember.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Modify Access Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['admin', 'member', 'viewer'].map(role => (
                      <button
                        key={role}
                        onClick={() => handleUpdateRole(editingMember.id, role)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                          editingMember.role === role ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-primary/30'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <button className="w-full py-4 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <History size={18} /> View Activity Log
                  </button>
                  <button 
                    onClick={() => { alert('Deactivation logic here'); setEditingMember(null); }}
                    className="w-full py-4 rounded-2xl font-bold bg-error/10 text-error hover:bg-error/20 transition-all"
                  >
                    Suspend Account
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setEditingMember(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full custom-shadow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
               <button onClick={() => { setShowInviteModal(false); setGeneratedLink(''); setInviteStatus('idle'); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <Plus size={24} className="rotate-45" />
               </button>
            </div>

            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <UserPlus className="text-primary" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Invite Member</h3>
              <p className="text-slate-500 text-sm mt-1">Growth starts with the right people.</p>
            </div>

            {(inviteStatus === 'success' || inviteStatus === 'mail-error') ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className={`p-6 border rounded-2xl text-center ${inviteStatus === 'success' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${inviteStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {inviteStatus === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <h4 className={`font-bold mb-1 ${inviteStatus === 'success' ? 'text-green-900' : 'text-amber-900'}`}>
                    {inviteStatus === 'success' ? 'Invitation Sent!' : 'Invite Created (Mail Failed)'}
                  </h4>
                  <p className={`text-sm mb-4 ${inviteStatus === 'success' ? 'text-green-700' : 'text-amber-700'}`}>
                    {inviteStatus === 'success' 
                      ? `The invitation has been sent to ${inviteData.email}.` 
                      : `The link was generated but we couldn't send the email. Share the link manually below.`}
                  </p>
                  
                  <div className="text-left bg-white border border-green-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Manual Link Fallback</p>
                    <div className="flex gap-2">
                       <input 
                        readOnly 
                        value={generatedLink}
                        className="bg-slate-50 border-none rounded-lg px-3 py-2 text-[10px] flex-1 font-mono outline-none"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink);
                          alert('Copied!');
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowInviteModal(false); setGeneratedLink(''); setInviteStatus('idle'); }}
                  className="w-full py-4 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="teammate@company.com"
                    value={inviteData.email}
                    onChange={e => setInviteData({...inviteData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Access Role</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                    value={inviteData.role}
                    onChange={e => setInviteData({...inviteData, role: e.target.value})}
                  >
                    <option value="member">Member (Create & Edit)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full py-4 rounded-2xl font-bold bg-primary text-white hover:bg-primary-container hover:shadow-lg hover:shadow-primary/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isSending ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
                  {isSending ? 'Sending Invitation...' : 'Send Invitation Email'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}


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
              className="bg-white p-6 rounded-2xl custom-shadow hover:shadow-xl transition-all group border border-transparent hover:border-primary/10 relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl uppercase tracking-tighter bg-primary text-on-primary shadow-lg shadow-primary/20`}>
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 tracking-tight text-lg">{member.name}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => toggleMenu(member.id, e)}
                    className="text-slate-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-50"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenuId === member.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                      <button 
                        onClick={() => handleSendEmail(member.email)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Mail size={14} /> Send Email
                      </button>
                      <button 
                        onClick={() => { alert('Viewing profile: ' + member.name); setActiveMenuId(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserPlus size={14} /> View Profile
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={() => { alert('Deactivating user: ' + member.id); setActiveMenuId(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 flex items-center gap-2"
                      >
                        Deactivate User
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <Mail size={16} />
                  {member.email}
                </div>
                <div className={`flex items-center gap-2 text-sm ${member.status === 'online' ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-green-600 animate-pulse' : 'bg-slate-300'}`} />
                  Last active: {member.status === 'online' ? 'Online Now' : member.lastActive}
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">ACTIVE TASKS</p>
                  <p className="text-3xl font-extrabold text-slate-900">{member.activeTasks}</p>
                </div>
                <div className="flex -space-x-3">
                   <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm overflow-hidden">
                     <img src={`https://i.pravatar.cc/150?u=${member.id}`} alt="" />
                   </div>
                   <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                     +{Math.floor(Math.random() * 5) + 1}
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setEditingMember(member)}
                className="w-full py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Settings2 size={16} />
                Manage
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
            <p className="text-indigo-100 text-xs mt-2">Active seats: {members.length} / 20</p>
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
