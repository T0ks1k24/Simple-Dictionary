const API_URL = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('token');
const getRefresh = () => localStorage.getItem('refresh_token');

const setTokens = (access, refresh) => {
  if (access) localStorage.setItem('token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const refresh = getRefresh();
    if (refresh) {
      const rr = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (rr.ok) {
        const d = await rr.json();
        setTokens(d.access, d.refresh);
        res = await fetch(url, { ...options, headers: { ...headers, Authorization: `Bearer ${d.access}` } });
      } else {
        clearTokens();
        window.location.reload();
      }
    }
  }

  return res;
};

export const api = {
  auth: {
    login: async (username, password) => {
      const res = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      localStorage.setItem('user', JSON.stringify({ username }));
      return data;
    },
    register: async (username, email, password) => {
      const res = await request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    },
    logout: () => clearTokens(),
  },
  words: {
    getAll: async (search = '') => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await request(`/dictionary/words/${q}`);
      if (!res.ok) throw new Error('Failed to fetch words');
      const data = await res.json();
      return data.results ?? data;
    },
    create: async (data) => {
      const res = await request('/dictionary/words/', { method: 'POST', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to create word');
      return res.json();
    },
    update: async (id, data) => {
      const res = await request(`/dictionary/words/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to update word');
      return res.json();
    },
    delete: async (id) => {
      const res = await request(`/dictionary/words/${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete word');
    },
    play: async (count = 10) => {
      const res = await request(`/dictionary/words/play/?count=${count}`);
      if (!res.ok) throw new Error('Failed to start game');
      return res.json();
    },
  },
};
