import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('rbac_token'));
  const [loading, setLoading] = useState(true);

  const hasPermission = useCallback((permKey) => {
    return permissions.includes(permKey);
  }, [permissions]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('rbac_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setPermissions(data.permissions);
    return data;
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (_) {}
    localStorage.removeItem('rbac_token');
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const refreshUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPermissions(data.permissions);
      } else {
        localStorage.removeItem('rbac_token');
        setToken(null);
      }
    } catch (_) {
      localStorage.removeItem('rbac_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const apiCall = useCallback(async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (res.status === 401) { logout(); throw new Error('Session expired.'); }
    return { ok: res.ok, status: res.status, data };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, permissions, token, loading, login, logout, hasPermission, apiCall, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
