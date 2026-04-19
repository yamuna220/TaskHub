export type View = 'login' | 'dashboard' | 'tasks' | 'team' | 'audit' | 'settings';

export interface Task {
  id: string;
  title: string;
  project: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  lastActive: string;
  activeTasks: number;
  avatar: string;
  initials: string;
  status: 'online' | 'offline';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
    initials?: string;
  };
  action: string;
  resource: string;
  ip: string;
  details: string;
  type: 'success' | 'warning' | 'error' | 'info';
}
