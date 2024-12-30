import { auth } from "@/lib/firebase/client";
import {
  AuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  User
} from "firebase/auth";
import toast from "react-hot-toast";

export enum LoginOption {
  GOOGLE = "Google",
  GITHUB = "GitHub",
  EMAIL = "Email",
}

interface LoginResponse {
  success: boolean;
  user?: User
  error?: string;
}

export async function loginWithProvider(provider: AuthProvider): Promise<LoginResponse> {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log(`Signed in user: ${user.displayName || user.email}`);
    return { success: true, user };
  } catch (error: any) {
    toast.error(`Failed to sign in: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = result.user;
    console.log(`Signed in user: ${user.displayName || user.email}`);
    return { success: true, user };
  } catch (error: any) {
    toast.error(`Failed to sign in: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}