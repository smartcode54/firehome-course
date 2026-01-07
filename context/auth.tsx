"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getIdTokenResult } from "firebase/auth";
import { setToken, removeToken } from "./action";

type ParsedTokenResult = {
  [key: string]: any;
};

type AuthContextType = {
  currentUser: User | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customClaims, setCustomClaims] = useState<ParsedTokenResult | null>(null);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user ? user : null);
      if (user) {
        try {
          const tokenResult = await getIdTokenResult(user);
          console.log("tokenResult:", tokenResult);
          const token = tokenResult.token;
          const refreshToken = user.refreshToken;
          const claims = tokenResult.claims;
          setCustomClaims(claims ?? null);
          if (token && refreshToken) {
            await setToken({ 
              token, 
              refreshToken 
            });
          }
        } catch (error) {
          console.error("Error getting token:", error);
        }
      } else {
        await removeToken();
        setCustomClaims(null);
      }
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
