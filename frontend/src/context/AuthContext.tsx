import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Initializing auth listener...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AuthProvider: Auth state changed. User:", currentUser?.email || "Logged out");
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error("AuthProvider: Auth state error:", error);
      setLoading(false);
      toast.error("Authentication system error. Please check your connection.");
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      console.log("AuthProvider: Attempting Google Login...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("AuthProvider: Google Login successful:", result.user.email);
    } catch (error: any) {
      console.error("Google login error:", error);
      if (error.code === 'auth/popup-blocked') {
        toast.error("Pop-up blocked! Please allow pop-ups for this site.");
      } else if (error.code === 'auth/configuration-not-found') {
        toast.error("Firebase is not configured correctly. Check your environment variables.");
      } else {
        toast.error(error.message || "Failed to login with Google");
      }
      throw error;
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      console.log("AuthProvider: Attempting Email Login...");
      await signInWithEmailAndPassword(auth, email, pass);
      console.log("AuthProvider: Email Login successful");
    } catch (error: any) {
      console.error("Email login error:", error);
      let message = "Failed to sign in";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Invalid email or password";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Try again later.";
      }
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      console.log("AuthProvider: Attempting Registration...");
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      console.log("AuthProvider: Registration successful");
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already in use");
      } else {
        toast.error(error.message || "Failed to create account");
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthProvider: Logging out...");
      await signOut(auth);
      console.log("AuthProvider: Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
