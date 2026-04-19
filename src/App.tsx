import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import TeamView from './components/TeamView';
import AuditLogView from './components/AuditLogView';
import SettingsView from './components/SettingsView';
import RegisterView from './components/RegisterView';
import TaskDetailModal from './components/TaskDetailModal';
import CreateTaskModal from './components/CreateTaskModal';
import { View, Task } from './types';
import { api } from './lib/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const init = async () => {
      if (isLoggedIn) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid", error);
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      }
      setIsInitialLoad(false);
    };
    init();
  }, [isLoggedIn]);

  const handleLogin = (data: any) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView user={user} onNewTask={() => setIsCreateModalOpen(true)} />;
      case 'tasks': return <TasksView onTaskClick={setSelectedTask} onNewTask={() => setIsCreateModalOpen(true)} user={user} />;
      case 'team': return <TeamView />;
      case 'audit': return <AuditLogView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <h1 className="text-white font-bold tracking-tighter text-xl">Initializing TaskHub...</h1>
        </motion.div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return authMode === 'login' 
      ? <LoginView onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
      : <RegisterView onBackToLogin={() => setAuthMode('login')} />;
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} user={user} />
      
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopBar title={currentView} />
        
        <main className="flex-1 mt-16 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <TaskDetailModal 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
           // We might want to trigger a global refresh or just trust individual views
           window.location.reload(); // Simple refresh for now to update statistics
        }}
        user={user}
      />
    </div>
  );
}
