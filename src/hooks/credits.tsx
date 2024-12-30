"use client";

import { getOrInitCreditsBalance } from "@/app/actions";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
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
interface CreditsContextTypeValue {
  isLoading: boolean;
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
}

// Create the Context with a default undefined value
const CreditsContext = createContext<CreditsContextTypeValue | undefined>(
  undefined,
);

// Define the Props type for the provider
interface CreditsProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const CreditsProvider: React.FC<CreditsProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user && user.uid) {
        const { balance, error } = await getOrInitCreditsBalance(user.uid);
        if (error) {
          console.error(`Failed to get credit balance: ${error}`);
          setBalance(0);
        } else {
          setBalance(balance || 0);
        }
      } else {
        setBalance(0);
      }
      setIsLoading(false);
    });
  }, [auth]);

  return (
    <CreditsContext.Provider value={{ isLoading, balance, setBalance }}>
      {children}
    </CreditsContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useCredits = (): CreditsContextTypeValue => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};
