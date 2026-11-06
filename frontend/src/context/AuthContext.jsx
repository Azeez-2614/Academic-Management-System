import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getCurrentUser } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('sms_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sms_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('sms_auth_token');
      if (storedToken) {
        try {
          const res = await getCurrentUser();
          setUser(res.data);
          localStorage.setItem('sms_user', JSON.stringify(res.data));
        } catch (err) {
          // Token is invalid or expired
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    const onExpired = () => handleLogout();
    const onLogout = () => handleLogout();

    window.addEventListener('auth:expired', onExpired);
    window.addEventListener('auth:logout', onLogout);

    return () => {
      window.removeEventListener('auth:expired', onExpired);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  const handleLogin = async (credentials) => {
    const res = await loginUser(credentials);
    const data = res.data;
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const handleLogout = () => {
    logoutUser();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
