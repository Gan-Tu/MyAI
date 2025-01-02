// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { auth } from "@/lib/firebase/client";
import {
  AuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
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

interface AuthResponse {
  user?: User
  error?: string;
}

export async function loginWithProvider(provider: AuthProvider): Promise<AuthResponse> {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log(`Signed in user: ${user.displayName || user.email}`);
    toast.success("Successfully signed in!")
    return { user };
  } catch (error: any) {
    toast.error(`Failed to sign in: ${error.message}`);
    return { error: error.message };
  }
}

export async function loginWithEmail(email: string, password: string, rememberMe: boolean): Promise<AuthResponse> {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = result.user;
    console.log(`Signed in user: ${user.displayName || user.email}`);
    toast.success("Successfully signed in!")
    return { user };
  } catch (error: any) {
    toast.error(`Failed to sign in: ${error.message}`);
    return { error: error.message };
  }
}

export async function createAccount(email: string, password: string, rememberMe: boolean): Promise<AuthResponse> {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user;
    console.log(`Signed in user: ${user.displayName || user.email}`);
    toast.success("Successfully signed in!")
    return { user };
  } catch (error: any) {
    console.log(error)
    toast.error(`Failed to sign up: ${error.message}`);
    return { error: error.message };
  }
}

export async function resetPassword(email: string) {
  try {
    if (!email) {
      return { error: "Missing email" };
    }
    await sendPasswordResetEmail(auth, email)
    toast.success("Password reset email sent, if account exists.")
    return { error: null }
  } catch (error: any) {
    console.log(error)
    toast.error(`Failed to reset password: ${error.message}`);
    return { error: error.message };
  }
}