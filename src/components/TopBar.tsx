import { Search, Bell, HelpCircle } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/70 backdrop-blur-md flex justify-between items-center px-8 z-40 border-b border-slate-100">
      <h2 className="text-2xl font-bold tracking-tighter text-slate-900 capitalize">{title}</h2>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all duration-200 focus:w-80"
          />
        </div>
        
        <button className="hover:bg-indigo-50 rounded-full p-2 text-slate-500 transition-all duration-300 active:scale-90">
          <Search size={20} className="md:hidden" />
          <HelpCircle size={20} className="hidden md:block" />
        </button>
        
        <button className="hover:bg-indigo-50 rounded-full p-2 text-slate-500 transition-all duration-300 relative active:scale-90">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
