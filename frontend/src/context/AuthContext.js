import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API = `${process.env.REACT_APP_API_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIdleTimeout = () => {
      const lastActive = localStorage.getItem('lastActive');
      const now = Date.now();
      const IDLE_TIMEOUT = 72 * 60 * 60 * 1000; // 72 hours in milliseconds

      if (lastActive && now - parseInt(lastActive) > IDLE_TIMEOUT) {
        logout();
        return true;
      }
      return false;
    };

    if (token) {
      const isExpired = checkIdleTimeout();
      if (!isExpired) {
        localStorage.setItem('lastActive', Date.now().toString());
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUser();
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('lastActive', Date.now().toString());
    setToken(access_token);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  const register = async (userData) => {
    await axios.post(`${API}/auth/register`, userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastActive');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
