"use client";

import { auth } from "@/lib/firebase/client";
import crypto from "crypto";
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

// Define the type for the context value
interface SessionContextTypeValue {
  isLoading: boolean;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  gravatarUrl: string | null;
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

function getGravatarUrl(email: string, size = 24) {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = crypto.createHash("sha256").update(trimmedEmail).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

// Create the Provider component
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [gravatarUrl, setGravatarUrl] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        if (user.email) {
          setGravatarUrl(getGravatarUrl(user.email));
        }
        await getIdToken(user).then(setToken).catch(console.error);
      } else {
        setUser(null);
        setToken(null);
        setGravatarUrl(null);
      }
      setIsLoading(false);
    });
  }, []);

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
      value={{
        isLoading,
        user,
        setUser,
        gravatarUrl,
        token,
        signOut: handleSignOut,
      }}
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
