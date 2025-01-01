"use client";

import { deductCreditsBalanceBy, getOrInitCreditsBalance } from "@/app/actions";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
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
interface CreditsContextTypeValue {
  isLoading: boolean;
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
  deduct: (credit: number) => Promise<boolean>;
}

// Create the Context with a default undefined value
const CreditsContext = createContext<CreditsContextTypeValue | undefined>(
  undefined,
);

// Define the Props type for the provider
interface CreditsProviderProps {
  enableCredits?: boolean;
  children: ReactNode;
}

// Create the Provider component
export const CreditsProvider: React.FC<CreditsProviderProps> = ({
  enableCredits = false,
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [uid, setUid] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const router = useRouter();

  const deduct = async (credit: number = 1) => {
    if (!enableCredits) {
      return true;
    }
    if (!uid) {
      router.push("/login");
      toast.error("Sign in to use your credits!");
      return false;
    }
    const { balance: newBalance, error } = await deductCreditsBalanceBy(
      uid,
      credit,
    );
    if (newBalance !== undefined) {
      setBalance(newBalance);
    }
    if (error) {
      toast.error(error);
      return false;
    }
    return true;
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (enableCredits) {
        if (user && user.uid) {
          setUid(user.uid);
          const { balance, error } = await getOrInitCreditsBalance(user.uid);
          if (error) {
            console.error(`Failed to get credit balance: ${error}`);
            setBalance(0);
          } else {
            setBalance(balance || 0);
          }
        } else {
          setUid(null);
          setBalance(0);
        }
      }
      setIsLoading(false);
    });
  }, [enableCredits]);

  return (
    <CreditsContext.Provider value={{ isLoading, balance, setBalance, deduct }}>
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
