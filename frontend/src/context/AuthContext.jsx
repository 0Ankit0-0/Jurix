import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced token refresh mechanism
  const refreshToken = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token || refreshing) return false;

    setRefreshing(true);
    try {
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.valid && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        return true;
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      logout();
    } finally {
      setRefreshing(false);
    }
    return false;
  };

  // Enhanced authentication check
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (!token) {
        console.log('📝 No token found');
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to use cached user data first
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch {
          console.error('Invalid user data in localStorage');
        }
      }

      console.log('🔍 Verifying token...');
      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.valid && response.data.user) {
        console.log('✅ Token valid, user authenticated:', response.data.user.email);
        setIsLoggedIn(true);
        setUser(response.data.user);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);

      // Clear invalid tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setIsLoggedIn(false);
      setUser(null);

      // Only show error if it's not a 401 (expected for unauthenticated users)
      if (error.response?.status !== 401) {
        console.error('Unexpected auth error:', error);
        toast.error('Authentication error. Please log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced login function
  const login = (token, userData) => {
    console.log('🔐 Logging in user:', userData.email);

    if (!token || !userData) {
      toast.error('Invalid login data');
      return false;
    }

    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setIsLoggedIn(true);
      setUser(userData);

      console.log('✅ User logged in successfully');
      toast.success(`Welcome back, ${userData.firstName || userData.name || 'User'}!`);
      return true;
    } catch (error) {
      console.error('❌ Error storing login data:', error);
      toast.error('Failed to save login information');
      return false;
    }
  };

  // Enhanced logout function
  const logout = async () => {
    console.log('🚪 Logging out user...');

    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Notify backend about logout
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('❌ Logout API error (non-critical):', error);
    } finally {
      // Always clear local data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setIsLoggedIn(false);
      setUser(null);

      console.log('✅ User logged out successfully');
      toast.success('Logged out successfully');

      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  };

  // Enhanced Google login handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      console.log('🔐 Processing Google login...');

      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential
      });

      console.log('Google login response:', response.data);

      if (response.data.token && response.data.user) {
        const success = login(response.data.token, response.data.user);

        if (success) {
          const message = response.data.is_new_user
            ? '🎉 Account created successfully!'
            : '🎉 Google login successful!';
          toast.success(message);
          return { success: true, isNewUser: response.data.is_new_user };
        }
      }

      throw new Error('Invalid response from server');

    } catch (error) {
      console.error('❌ Google login error:', error);

      let errorMessage = 'Google login failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile
  const updateUser = (updatedData) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      toast.success('Profile updated successfully!');
    }
  };

  // Check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Auto-refresh token periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoggedIn && isTokenExpired()) {
        console.log('🔄 Token expired, attempting refresh...');
        refreshToken();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    // State
    isLoggedIn,
    user,
    loading,
    refreshing,

    // Actions
    login,
    logout,
    checkAuth,
    handleGoogleLogin,
    updateUser,
    refreshToken,

    // Utils
    isTokenExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};