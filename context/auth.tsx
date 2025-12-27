"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

type AuthContextType = {
  currentUser: User | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // currentUser will be set to null automatically by onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error);
      throw error; // Re-throw to let component handle it
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
