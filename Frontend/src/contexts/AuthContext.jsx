import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fitbox_shipments_token') || localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const activeToken = localStorage.getItem('fitbox_shipments_token') || localStorage.getItem('token');
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${activeToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setToken(activeToken);
        } else {
          localStorage.removeItem('fitbox_shipments_token');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // If network issue, keep token if user was already set, else clear
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (name, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('fitbox_shipments_token', data.token);
        localStorage.setItem('token', data.token); // Also set for cross-admin compatibility
        setUser({ _id: data._id, name: data.name });
        setToken(data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Could not connect to server. Please ensure backend is running.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('fitbox_shipments_token');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    API_URL,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
