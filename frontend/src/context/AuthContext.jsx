import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    return localStorage.getItem('isCheckedIn') === 'true';
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    return localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];
  });
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await api.get('/shifts');
        setShifts(response.data);
      } catch (err) {
        console.error('Initial Shifts Load Error:', err);
      }
    };
    fetchShifts();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const domain = email.split('@')[1];
      const tenant = domain ? domain.split('.')[0] : 'default-tenant';
      
      const response = await api.post('/auth/login', { email, password }, {
        headers: { 'x-tenant-slug': tenant }
      });
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenantSlug', tenant);
      
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login Error:', err);
      throw err;
    }
  };

  const googleLogin = async (domain) => {
    // Mock Google login
    const mockUser = { id: 1, name: 'Google User', email: 'user@' + (domain || 'company') + '.com', role: 'ADMIN' };
    localStorage.setItem('token', 'google-mock-token-' + Math.random());
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('tenantDomain', domain);
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isCheckedIn');
    localStorage.removeItem('tenantSlug');
    setUser(null);
    setIsCheckedIn(false);
  };

  const toggleCheckIn = () => {
    const newState = !isCheckedIn;
    setIsCheckedIn(newState);
    localStorage.setItem('isCheckedIn', newState);
  };

  const handleSetSelectedDate = (date) => {
    setSelectedDate(date);
    localStorage.setItem('selectedDate', date);
  };

  const handleUpdateShifts = (newShifts) => {
    setShifts(newShifts);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, googleLogin, logout, loading, 
      isCheckedIn, toggleCheckIn,
      selectedDate, setSelectedDate: handleSetSelectedDate,
      shifts, setShifts: handleUpdateShifts
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
