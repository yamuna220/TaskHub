const API_BASE_URL = '/api';

class ApiService {
  private getToken() {
    return localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Tasks
  getTasks(filters: any = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  createTask(task: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  updateTask(id: string, updates: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Users
  getUsers() {
    return this.request('/users');
  }

  // Audit
  getAuditLogs() {
    return this.request('/audit/logs');
  }

  getAuditStats() {
    return this.request('/audit/stats');
  }
}

export const api = new ApiService();
