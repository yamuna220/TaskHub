import { motion } from 'motion/react';
import { View } from '../types';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  History, 
  Settings,
  Rocket,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  user: any;
}

export default function Sidebar({ currentView, onViewChange, onLogout, user }: SidebarProps) {
  const role = user?.role || 'admin';
  
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'member', 'viewer'] },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, roles: ['admin', 'member', 'viewer'] },
    { id: 'team', label: 'Team', icon: Users, roles: ['admin'] },
    { id: 'audit', label: 'Audit Log', icon: History, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ] as const;

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 z-50">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg btn-primary-gradient flex items-center justify-center text-white shadow-lg">
          <Rocket size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-primary">TaskHub Pro</h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">{role} Role</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-white text-primary font-semibold shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-primary hover:bg-slate-100/50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200/50 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <img 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full bg-surface-container object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFqDzu6LyLIbT0fPTQP8Ovox64UgLINFPGfR2oP_iXaguZ9BRSeR1RUiaBIDF7O0SlK_TWoXS-_97EOc2bmq7nC9h037NWodpkr-kw9ESVfcfl1hiUrjv3qJfgE4CwaB4tHJR4czKul9CtmMtMXHJ5WtW3HikzA-lIBDV9_HNR3pOkLRfsI8AJ0PgUbU_a6sli-O1cBX_0c9noqf8_VtGxRlzXhD2tm0DN1YhrZQWIOIJ6MmfAmmWd_CHeEuKggXIokisp304D041t"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-error hover:bg-error/5 rounded-lg transition-all"
        >
          <LogOut size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
