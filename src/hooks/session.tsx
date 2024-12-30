"use client";

import { auth } from "@/lib/firebaseConfig";
import { getIdToken, onAuthStateChanged, signOut, User } from "firebase/auth";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

// Define the type for the context value
interface SessionContextTypeValue {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  token: string | null;
  signOut: () => Promise<void>;
}

// Create the Context with a default undefined value
const SessionContext = createContext<SessionContextTypeValue | undefined>(
  undefined,
);

// Define the Props type for the provider
interface SessionProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        toast.success("Successfully signed in!");
        setUser(user);
        getIdToken(user).then(setToken).catch(console.error);
      } else {
        setUser(null);
        setToken(null);
      }
    });
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setToken(null);
      console.info("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SessionContext.Provider
      value={{ user, setUser, token, signOut: handleSignOut }}
    >
      {children}
    </SessionContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useSession = (): SessionContextTypeValue => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
