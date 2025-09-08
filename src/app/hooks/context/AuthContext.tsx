'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  clearAuth: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const adminDocRef = doc(firestore, 'admin', firebaseUser.uid);
        const adminSnap = await getDoc(adminDocRef);
        setIsAdmin(adminSnap.exists() && adminSnap.data()?.isAdmin === true);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isAdmin,
        loading,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
