import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential
} from "firebase/auth";

import { auth } from "./config";

// Google
export const signInWithGoogle = async (): Promise<UserCredential | null> => {
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Google Sign-in Error:", err);
    return null;
  }
};

// Email/Password
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Signup Error:", err);
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Signin Error:", err);
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout Error:", err);
  }
};
