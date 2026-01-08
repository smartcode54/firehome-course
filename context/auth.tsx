"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getIdTokenResult, getIdToken } from "firebase/auth";
import { setToken, removeToken, rotateToken } from "./action";

type ParsedTokenResult = {
  [key: string]: any;
};

type AuthContextType = {
  currentUser: User | null;
  logout: () => Promise<void>;
  customClaims: ParsedTokenResult | null;
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
          // Get initial token
          const tokenResult = await getIdTokenResult(user);
          console.log("tokenResult", tokenResult);
          const token = tokenResult.token;
          const refreshToken = user.refreshToken;
          const claims = tokenResult.claims;
          setCustomClaims(claims ?? null);
          
          if (token && refreshToken) {
            // Send token to server to set admin role if needed
            await setToken({ 
              token, 
              refreshToken 
            });
            
            // Force refresh token to get updated claims (especially if admin role was just set)
            await getIdToken(user, true);
            const updatedTokenResult = await getIdTokenResult(user);
            setCustomClaims(updatedTokenResult.claims ?? null);
            
            // Update cookie with new token (token rotation)
            if (updatedTokenResult.token) {
                await rotateToken(updatedTokenResult.token);
            }
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
    <AuthContext.Provider value={{ currentUser, logout, customClaims }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
