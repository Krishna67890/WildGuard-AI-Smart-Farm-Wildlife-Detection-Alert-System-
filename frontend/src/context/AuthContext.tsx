import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, pass: string, name: string, farmName: string, phone: string) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  canAdmin: boolean;
  canOperate: boolean;
  isViewerOnly: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('VIEWER');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          setRole(userData.role);
        } else {
          // Fallback if doc doesn't exist yet
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'VIEWER',
            phone: '',
            farmName: ''
          };
          setUser(fallbackUser);
          setRole('VIEWER');
        }
      } else {
        setUser(null);
        setRole('VIEWER');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Use popup for sign-in
      const res = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', res.user.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          id: res.user.uid,
          name: res.user.displayName || 'Google User',
          email: res.user.email || '',
          role: 'FARMER', // Default to Farmer for new Google signups
          phone: '',
          farmName: ''
        };
        await setDoc(doc(db, 'users', res.user.uid), newUser);
        setUser(newUser);
        setRole('FARMER');
      } else {
        const userData = userDoc.data() as User;
        setUser(userData);
        setRole(userData.role);
      }
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      // Check for popup-closed-by-user or blocked popups
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Authentication cancelled by user.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Just ignore duplicate requests
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const register = async (email: string, pass: string, name: string, farmName: string, phone: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser: User = {
      id: res.user.uid,
      name,
      email,
      role: 'FARMER',
      phone,
      farmName
    };
    await setDoc(doc(db, 'users', res.user.uid), newUser);
    setUser(newUser);
    setRole('FARMER');
  };

  const switchRole = async (newRole: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      await setDoc(doc(db, 'users', user.id), updatedUser);
      setUser(updatedUser);
      setRole(newRole);
    }
  };

  const canAdmin = role === 'ADMIN';
  const canOperate = role === 'ADMIN' || role === 'FARMER';
  const isViewerOnly = role === 'VIEWER';

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      login,
      loginWithGoogle,
      logout,
      register,
      switchRole,
      canAdmin,
      canOperate,
      isViewerOnly
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
