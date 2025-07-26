"use client"; // Add this line at the top

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  logout as firebaseLogout,
} from "../firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import type { User as FirebaseUser } from "firebase/auth";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  level: number;
}

interface AuthContextType {
  user: User | null;
  idToken: string | null; // From previous suggestion
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatUser = (firebaseUser: FirebaseUser): User => ({
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    email: firebaseUser.email || "",
    avatar: firebaseUser.photoURL || undefined,
    points: 0,
    level: 1,
  });

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     if (firebaseUser) {
  //       const formatted = formatUser(firebaseUser);
  //       setUser(formatted);
  //       localStorage.setItem("user", JSON.stringify(formatted));
  //       const token = await firebaseUser.getIdToken();
  //       setIdToken(token);
  //     } else {
  //       setUser(null);
  //       setIdToken(null);
  //       localStorage.removeItem("user");
  //     }
  //     setIsLoading(false);
  //   });
  //
  //   return () => unsubscribe();
  // }, []);
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const formatted = formatUser(firebaseUser);
      setUser(formatted);
      const token = await firebaseUser.getIdToken();
      setIdToken(token);
      console.log("User logged in:", formatted, "Token:", token); // Add this
    } else {
      setUser(null);
      setIdToken(null);
      console.log("User logged out"); // Add this
    }
    setIsLoading(false);
  });

  return () => unsubscribe();
}, []);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmail(email, password);
    if (!credential?.user) {
      throw new Error("Invalid credentials");
    }

    const formatted = formatUser(credential.user);
    setUser(formatted);
    const token = await credential.user.getIdToken();
    setIdToken(token);
    localStorage.setItem("user", JSON.stringify(formatted));
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithGoogle();
    if (credential?.user) {
      const formatted = formatUser(credential.user);
      setUser(formatted);
      const token = await credential.user.getIdToken();
      setIdToken(token);
      localStorage.setItem("user", JSON.stringify(formatted));
    }
  };

  const logout = () => {
    firebaseLogout();
    setUser(null);
    setIdToken(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        login,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
