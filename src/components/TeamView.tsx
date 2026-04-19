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
  const [isInviting, setIsInviting] = useState(false);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const invite = await api.createInvitation(inviteData);
      const link = `${window.location.origin}/register?inviteToken=${invite.token}`;
      setGeneratedLink(link);
    } catch (err) {
      console.error('Failed to create invitation', err);
    } finally {
      setIsInviting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative"
          >
            <button 
              onClick={() => { setShowInviteModal(false); setGeneratedLink(''); }}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"
            >
              <Plus size={20} className="rotate-45 text-slate-400" />
            </button>
            <h4 className="text-xl font-bold mb-2">Invite Team Member</h4>
            <p className="text-slate-500 text-sm mb-6">Send a manual link to your colleague to join this workspace.</p>

            {generatedLink ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Shared Invitation Link</p>
                  <code className="text-[10px] break-all text-slate-600 block bg-white p-2 rounded border border-slate-100 mb-4">{generatedLink}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Copy Link
                  </button>
                </div>
                <p className="text-center text-[10px] text-slate-400">Share this link manually via Slack, Email, or WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Work Email</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="teammate@organization.com"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm appearance-none"
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  >
                    <option value="admin">Administrator</option>
                    <option value="member">Team Member</option>
                    <option value="viewer">Viewer Only</option>
                  </select>
                </div>
                <button 
                  disabled={isInviting}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isInviting ? <Loader2 className="animate-spin" size={20} /> : "Generate Invite Link"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

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
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl uppercase tracking-tighter bg-primary text-on-primary`}>
                  {member.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 tracking-tight text-lg">{member.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed-variant`}>
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
            </div>

            <button className="mt-auto w-full py-2.5 rounded-lg text-sm font-bold bg-surface-container-high text-on-surface-variant hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              <Settings2 size={16} />
              Manage
            </button>
          </motion.div>
        ))}

        {/* Add Member Card */}
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-surface-container-low border-2 border-dashed border-outline-variant/30 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 group hover:bg-white hover:border-primary transition-all duration-300 min-h-[250px]"
        >
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
