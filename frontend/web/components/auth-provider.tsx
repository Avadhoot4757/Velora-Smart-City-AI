"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithGoogle,
  signInWithEmail,
  logout as firebaseLogout,
} from "../firebase/auth"

import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"
import type { User as FirebaseUser } from "firebase/auth"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  points: number
  level: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const formatUser = (firebaseUser: FirebaseUser): User => ({
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    email: firebaseUser.email || "",
    avatar: firebaseUser.photoURL || undefined,
    points: 0, // You can load from Firestore later
    level: 1,  // You can load from Firestore later
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const formatted = formatUser(firebaseUser)
        setUser(formatted)
        localStorage.setItem("user", JSON.stringify(formatted))
      } else {
        setUser(null)
        localStorage.removeItem("user")
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmail(email, password)
    if (!credential?.user) {
      throw new Error("Invalid credentials")
    }

    const formatted = formatUser(credential.user)
    setUser(formatted)
    localStorage.setItem("user", JSON.stringify(formatted))
  }

  const loginWithGoogle = async () => {
    const credential = await signInWithGoogle()
    if (credential?.user) {
      const formatted = formatUser(credential.user)
      setUser(formatted)
      localStorage.setItem("user", JSON.stringify(formatted))
    }
  }

  const logout = () => {
    firebaseLogout()
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
