import { useState } from 'react';
import { Search, Bell, HelpCircle, CheckCircle2, AlertTriangle, User } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, title: 'New Task Assigned', desc: 'Project "Cooking" has a new task for you.', icon: CheckCircle2, color: 'text-primary' },
    { id: 2, title: 'System Alert', desc: 'Database migration completed successfully.', icon: AlertTriangle, color: 'text-amber-500' },
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/70 backdrop-blur-md flex justify-between items-center px-8 z-[60] border-b border-slate-100">
      <h2 className="text-2xl font-bold tracking-tighter text-slate-900 capitalize">{title}</h2>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Quick search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all duration-200 focus:w-80"
          />
        </div>
        
        <button className="hover:bg-indigo-50 rounded-full p-2 text-slate-500 transition-all duration-300 active:scale-90 relative">
          <HelpCircle size={20} className="hidden md:block" />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`hover:bg-indigo-50 rounded-full p-2 text-slate-500 transition-all duration-300 relative active:scale-90 ${showNotifications ? 'bg-indigo-50 text-primary' : ''}`}
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-100 font-bold text-sm bg-slate-50">Notifications</div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 border-b border-slate-100 last:border-0 cursor-pointer">
                      <div className="flex gap-3">
                        <div className={`mt-1 ${n.color}`}><n.icon size={16} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{n.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 text-[10px] font-bold text-primary hover:bg-primary/5 uppercase tracking-widest transition-colors">Clear All</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
