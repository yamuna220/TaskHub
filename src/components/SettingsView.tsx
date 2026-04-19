import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CloudUpload, 
  Timer, 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  Github, 
  Facebook,
  Mail
} from 'lucide-react';

export default function SettingsView() {
  const [duration, setDuration] = useState(24);

  return (
    <div className="p-8 max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Organization Settings */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Organization Settings</h3>
          <p className="text-sm text-slate-500">Manage your workspace identity and public profile.</p>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Logo Upload */}
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Organization Logo</label>
              <div className="group relative w-48 h-48 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container-high hover:border-primary transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98]">
                <img 
                  alt="Org Logo" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-10 transition-opacity duration-300" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0TuEOQlS7xlPQ0pMV74VFriCDNJNhfR96CDxJ0MdNVxohZDlkM1hxInyY0-m-PFruCzr24k4dQUNzUeHccCMcEKju7KoFX-D86racJGe80XLSJQq09Mz56jkKft9nt_4cHw2EL1DqwlT-JfxRuwfjCIopcZvzVY0sVb1nQex8QUVkit7M2HJ-un1wytawkQDlgjGWgERqZJZX4rEjbjHIAP6qAwSdgjRrzmGYvrynPuaYqJyH096vMJ0ejIdHpnqFFFFZ6QEueOnO"
                  referrerPolicy="no-referrer"
                />
                <CloudUpload className="text-primary mb-2 group-hover:scale-110 transition-transform duration-300" size={40} />
                <span className="text-xs font-semibold text-slate-600">Click to upload</span>
                <span className="text-[10px] text-slate-400">SVG, PNG, JPG (max 2MB)</span>
              </div>
            </div>

            {/* Info Form */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Organization Name</label>
                <input 
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-low border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium" 
                  type="text" 
                  defaultValue="TaskHub Pro" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Workspace Domain</label>
                <div className="flex group">
                  <input 
                    className="flex-1 px-4 py-3 rounded-l-lg bg-surface-container-low border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium text-right" 
                    type="text" 
                    defaultValue="taskhub-pro" 
                  />
                  <span className="px-4 py-3 bg-surface-container rounded-r-lg border-l border-outline-variant/20 text-slate-500 font-medium group-focus-within:bg-primary/5 transition-colors duration-300">.taskhub.io</span>
                </div>
              </div>
              <div className="pt-4">
                <button className="btn-primary-gradient text-white px-8 py-3 rounded-lg font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Authentication */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Security & Authentication</h3>
          <p className="text-sm text-slate-500">Control access methods and session policies for your team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Controls */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Timer size={20} />
              </div>
              <h4 className="font-bold text-slate-800">JWT Expiry Period</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-500">Duration</span>
                <span className="text-primary bg-primary/5 px-2 py-1 rounded transition-all duration-300">{duration} Hours</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="720" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" 
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>1 Hour</span>
                <span>30 Days</span>
              </div>
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Defines the lifetime of access tokens. Shorter durations are more secure but require more frequent logins.
              </p>
            </div>
          </div>

          {/* Auth Toggles */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h4 className="font-bold text-slate-800">Access Control</h4>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Google OAuth', icon: Mail, checked: true },
                { label: 'GitHub Login', icon: Github, checked: true },
                { label: 'Facebook Login', icon: Facebook, checked: false }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <item.icon className="text-slate-400 group-hover:text-primary transition-colors duration-300" size={18} />
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                    <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer transition-all duration-300 peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
              <hr className="border-slate-100 my-2" />
              <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg hover:bg-primary/[0.03] transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary" size={18} />
                  <span className="text-sm font-bold text-slate-800">Enforce 2FA</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer transition-all duration-300 peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-error">Danger Zone</h3>
          <p className="text-sm text-slate-500">Irreversible actions that affect your entire organization.</p>
        </div>
        <div className="bg-error-container/10 rounded-xl p-8 border border-error/20 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-error-container/20 transition-colors duration-500">
          <div className="flex gap-6 items-start">
            <div className="bg-error/10 p-3 rounded-full text-error shrink-0">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-on-error-container">Delete Organization</h4>
              <p className="text-sm text-slate-600 mt-1 max-w-lg leading-relaxed">
                Once you delete an organization, there is no going back. This will permanently remove all tasks, team history, and audit logs associated with <strong>TaskHub Pro</strong>.
              </p>
            </div>
          </div>
          <button className="bg-error hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg whitespace-nowrap">
            Delete Organization
          </button>
        </div>
      </section>
    </div>
  );
}
