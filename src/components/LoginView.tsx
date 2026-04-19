import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, ShieldCheck, History, Mail, Lock, Eye, EyeOff, ArrowRight, Github, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

interface LoginViewProps {
  onLogin: (data: any) => void;
  onSwitchToRegister: () => void;
}

export default function LoginView({ onLogin, onSwitchToRegister }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      // Small delay to ensure everything is ready
      const handleOAuthLogin = async () => {
        try {
          localStorage.setItem('token', token);
          const userData = await api.getMe();
          onLogin({ token, user: userData });
        } catch (err) {
          console.error("OAuth login failed", err);
          setError("OAuth login failed. Please try again.");
        }
      };
      handleOAuthLogin();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Hero Section */}
      <section className="relative w-full md:w-1/2 bg-hero-gradient flex flex-col justify-center items-start p-8 md:p-16 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 rounded-full blur-[100px]"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <LayoutDashboard className="text-primary" size={28} />
            </div>
            <h1 className="text-white text-3xl font-extrabold tracking-tighter">TaskHub Pro</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              One platform.<br />
              Every team.<br />
              <span className="text-secondary-fixed">Zero compromise.</span>
            </h2>
            <p className="text-indigo-100 text-lg md:text-xl font-medium opacity-90">
              The ultimate enterprise operating system for complex workflows and high-performance teams.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: 'Isolation' },
              { icon: ShieldCheck, label: 'RBAC' },
              { icon: History, label: 'Audit Log' }
            ].map((feature, i) => (
              <div key={i} className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                <feature.icon className="text-secondary-fixed" size={14} />
                <span className="text-white text-xs font-semibold uppercase tracking-wider">{feature.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-20 pointer-events-none">
          <img 
            alt="abstract" 
            className="w-full h-full object-cover mix-blend-overlay" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9TGVfAZhIgxAhBWGp39g_DqW4u29MgKuQKLOf79V39rBhIxywb8rWuZHg-NJQn9SqBhTVNHQSyuSW6TGRGrXJSz8SroRCe8bgqUKAnf3xhN93kC7R_wCgQnFJx39yKcYMW0Xih9qLlHuq34N-yqIxdB1j6nkDXEqKX4IDYo4LG-8ANJeARF-lciVOQTeGRFIPwGA3Ehx5ZGy9AvSUKa7oesC5zNicBsOdLFvaXnjytBtLKtvAf4tLBo0F4T1QDRSWIG-1HEq1qIRV"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Login Card Section */}
      <section className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-[0_4px_20px_rgba(70,72,212,0.04),0_12px_40px_rgba(0,0,0,0.04)]"
        >
          <header className="mb-10 text-center md:text-left">
            <h3 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Welcome Back</h3>
            <p className="text-on-surface-variant text-sm">Please enter your credentials to access the hub.</p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <label className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 ml-1">Access Method</label>
                <div className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm font-semibold text-on-surface flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  Enterprise JWT Auth
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-outline-variant group-focus-within:text-primary transition-colors" size={20} />
              </div>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                placeholder="Email Address" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-outline-variant group-focus-within:text-primary transition-colors" size={20} />
              </div>
              <input 
                className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                placeholder="Password" 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline-variant hover:text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>


            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant">
                <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                Remember device
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full relative bg-hero-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-outline-variant uppercase tracking-widest">or continue with</span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">

              <button type="button" className="flex items-center justify-center gap-3 py-3 border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors">
                <Github size={20} />
                <span className="text-sm font-semibold text-on-surface">GitHub</span>
              </button>
            </div>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-on-surface-variant text-sm font-medium">
              Don't have an account? 
              <button 
                onClick={onSwitchToRegister}
                className="text-primary font-bold hover:underline ml-1"
              >
                Create Workspace
              </button>
            </p>
          </footer>
        </motion.div>

        <div className="mt-8 flex gap-6 text-[10px] font-bold text-outline uppercase tracking-widest">
          <a className="hover:text-on-surface" href="#">Privacy Policy</a>
          <a className="hover:text-on-surface" href="#">Terms of Service</a>
          <a className="hover:text-on-surface" href="#">Support</a>
        </div>
      </section>
    </main>
  );
}
