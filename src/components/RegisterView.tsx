import { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, ShieldCheck, History, Mail, Lock, User, Building, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

interface RegisterViewProps {
  onBackToLogin: () => void;
}

export default function RegisterView({ onBackToLogin }: RegisterViewProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    organizationDescription: '',
    role: 'admin'
  });
  const [verificationToken, setVerificationToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.register(formData);
      // Skip the success screen and go back to login immediately
      onBackToLogin();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-12 rounded-3xl shadow-xl text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-primary" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-4">Account Created Successfully!</h2>
          <p className="text-on-surface-variant mb-10">
            Your workspace for <span className="font-bold text-on-surface">{formData.email}</span> is ready! 
            Please use the testing shortcut below to activate your account and get started.
          </p>
          
          <div className="space-y-3 mb-8">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">Testing shortcut</p>
            <a 
              href={`http://localhost:5000/auth/verify-email?token=${verificationToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 border-2 border-primary/20 rounded-xl text-primary font-bold hover:bg-primary/5 transition-all"
            >
              Verify Immediately (Demo)
            </a>
          </div>

          <button 
            onClick={onBackToLogin}
            className="w-full bg-hero-gradient text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-all"
          >
            Go to Login
          </button>
        </motion.div>
      </main>
    );
  }

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
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <LayoutDashboard className="text-primary" size={24} />
            </div>
            <h1 className="text-white text-2xl font-extrabold tracking-tighter">TaskHub Pro</h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Join the <span className="text-secondary-fixed">Next Generation</span> of workflow management.
            </h2>
            <p className="text-indigo-100 text-base md:text-lg font-medium opacity-90">
              Create your organization and start collaborating with your team in minutes.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Registration Form Section */}
      <section className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-sm"
        >
          <header className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Create Account</h3>
            <p className="text-on-surface-variant text-sm">Set up your workspace and get started today.</p>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-3 text-error text-sm font-medium">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
                </div>
                <input 
                  name="firstName"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-medium" 
                  placeholder="First Name" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
                </div>
                <input 
                  name="lastName"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-medium" 
                  placeholder="Last Name" 
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
              </div>
              <input 
                name="email"
                type="email"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-medium" 
                placeholder="Work Email" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
              </div>
              <input 
                name="password"
                type="password"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-medium" 
                placeholder="Min 8 chars, uppercase, number & special char" 
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building className="text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
              </div>
              <input 
                name="organizationName"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-medium" 
                placeholder="Organization Name" 
                value={formData.organizationName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className="text-outline-variant group-focus-within:text-primary transition-colors" size={18} />
              </div>
              <select 
                name="role"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm font-medium appearance-none focus:ring-2 focus:ring-primary/20" 
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="admin">System Admin</option>
                <option value="member">Team Member</option>
                <option value="viewer">Viewer Only</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-hero-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 text-center font-medium">
            <p className="text-on-surface-variant text-sm">
              Already have an account? 
              <button 
                onClick={onBackToLogin}
                className="text-primary font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          </footer>
        </motion.div>
      </section>
    </main>
  );
}
