import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Link as LinkIcon, 
  User, 
  Shield, 
  Database, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { AuditEvent } from '../types';
import { api } from '../lib/api';

export default function AuditLogView() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [statsData, setStatsData] = useState({ totalEvents: 0, securityFlags: 0, retentionDays: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [logsData, metrics] = await Promise.all([
          api.getAuditLogs(),
          api.getAuditStats()
        ]);
        
        setStatsData(metrics);

        const mappedEvents = logsData.map((log: any) => ({
          id: log.id,
          timestamp: new Date(log.timestamp).toLocaleString(),
          user: { 
            name: 'User ' + log.user_id.slice(0, 4), // Should join with user table
            avatar: '',
            initials: 'U'
          },
          action: log.action,
          resource: log.entity_type + ':' + log.entity_id.slice(0, 8),
          ip: log.ip_address || 'N/A',
          details: JSON.stringify(log.changes).slice(0, 100),
          type: log.action === 'DELETE' ? 'error' : (log.action === 'UPDATE' ? 'warning' : 'success')
        }));
        setEvents(mappedEvents);
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-surface-container-low p-1 rounded-xl flex items-center gap-2">
          <div className="flex-1 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />
            <input 
              className="w-full bg-white border-none rounded-lg pl-11 py-3 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant transition-all duration-300" 
              placeholder="Search by user or action..." 
              type="text"
            />
          </div>
          <div className="flex gap-2 pr-1">
            <button className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all flex items-center gap-2">
              <Calendar size={16} />
              Last 7 Days
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all flex items-center gap-2">
              <Database size={16} />
              Event Type
            </button>
          </div>
        </div>
        <div className="md:col-span-4 flex justify-end items-center">
          <button className="h-full px-6 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-lg shadow-lg shadow-primary/10 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/15">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Resource</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {events.map((event, i) => (
                <motion.tr 
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-container-low transition-colors group"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-on-surface">{event.timestamp.split(' ').slice(0, 3).join(' ')}</div>
                    <div className="text-xs text-outline">{event.timestamp.split(' ').slice(3).join(' ')}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {event.user.avatar ? (
                        <img alt="User" className="w-8 h-8 rounded-full object-cover" src={event.user.avatar} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">
                          {event.user.initials}
                        </div>
                      )}
                      <span className="text-sm font-semibold">{event.user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${
                      event.type === 'success' ? 'bg-green-50 text-green-700' :
                      event.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                      event.type === 'error' ? 'bg-error-container text-error' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        event.type === 'success' ? 'bg-green-600' :
                        event.type === 'warning' ? 'bg-amber-600' :
                        event.type === 'error' ? 'bg-error' :
                        'bg-blue-600'
                      }`} />
                      {event.action}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <a className="text-sm font-medium text-primary hover:underline flex items-center gap-1" href="#">
                      <LinkIcon size={14} />
                      {event.resource}
                    </a>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap font-mono text-xs text-outline">
                    {event.ip}
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant max-w-xs truncate">
                    {event.details}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-surface-container bg-surface-container-low/30">
          <div className="text-sm text-outline">
            Showing <span className="font-bold text-on-surface">1-5</span> of <span className="font-bold text-on-surface">1,284</span> events
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-outline-variant disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold transition-transform hover:scale-110 active:scale-95">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface text-sm font-medium transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface text-sm font-medium transition-colors">3</button>
            <span className="text-outline mx-1">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface text-sm font-medium transition-colors">257</button>
            <button className="p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { label: 'Total Logs', value: statsData.totalEvents.toLocaleString(), change: 'Across entire workspace', icon: BarChart3, color: 'primary' },
          { label: 'Security Flags', value: statsData.securityFlags.toString(), change: 'Failed logins/deletions', icon: Shield, color: 'amber' },
          { label: 'Retention', value: `${statsData.retentionDays} Days`, change: 'System tracking active', icon: Database, color: 'secondary' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-outline-variant/15 flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              card.color === 'primary' ? 'bg-primary/10 text-primary' :
              card.color === 'amber' ? 'bg-amber-50 text-amber-700' :
              'bg-secondary/10 text-secondary'
            }`}>
              <card.icon size={24} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-outline mb-1">{card.label}</h4>
              <div className="text-2xl font-bold tracking-tighter text-on-surface">{card.value}</div>
              <div className={`text-xs font-medium mt-1 ${
                card.label === 'Security Flags' ? 'text-error' : 
                card.label === 'Avg. Events / Day' ? 'text-green-600' : 
                'text-outline'
              }`}>{card.change}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
