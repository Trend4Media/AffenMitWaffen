const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

class ApiClient {
  getToken() {
    return localStorage.getItem('auth_token');
  }

  setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  removeToken() {
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Netzwerkfehler' }));
      throw new Error(error.error || 'Ein Fehler ist aufgetreten');
    }

    return response.json();
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    // Kein Token mehr bei Registrierung (Account muss freigeschaltet werden)
    return data;
  }

  logout() {
    this.removeToken();
  }

  // Systems
  async getSystems() {
    return this.request('/systems');
  }

  async updateSystem(systemId, updates) {
    return this.request(`/systems/${systemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updatePlanet(systemId, planetId, updates) {
    return this.request(`/systems/${systemId}/planets/${planetId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async initializeSystems() {
    return this.request('/systems/initialize', {
      method: 'POST',
    });
  }

  // Admin
  async getUsers() {
    return this.request('/admin/users');
  }

  async activateUser(userId, isActive) {
    return this.request(`/admin/users/${userId}/activate`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async setUserAdmin(userId, isAdmin) {
    return this.request(`/admin/users/${userId}/admin`, {
      method: 'PATCH',
      body: JSON.stringify({ isAdmin }),
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiClient();
