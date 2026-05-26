import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  dbUser: any | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateLanguagePreference: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const token = await user.getIdToken();
          
          // Sync with backend — explicitly pass token in header
          // because auth.currentUser may not be set yet during onAuthStateChanged
          const response = await api.post('/auth/sync-user', { token }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDbUser(response.data.user);
          
          // If language was previously selected, update backend
          const savedLang = localStorage.getItem('i18nextLng');
          if (savedLang && response.data.user) {
             await api.patch(`/auth/users/${response.data.user._id}/language`, { language: savedLang }).catch(e => console.warn('Language sync failed', e));
          }
          
        } catch (error) {
          console.error("Error syncing user:", error);
          toast.error("Failed to authenticate with server");
        }
      } else {
        setCurrentUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setDbUser(null);
      localStorage.removeItem('firebaseIdToken');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Failed to log out");
    }
  };

  const updateLanguagePreference = async (lang: string) => {
    if (dbUser?._id) {
      try {
        await api.patch(`/auth/users/${dbUser._id}/language`, { language: lang });
      } catch (error) {
        console.error("Failed to update language on server", error);
      }
    }
  };

  const value = {
    currentUser,
    dbUser,
    loading,
    logout,
    updateLanguagePreference
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
