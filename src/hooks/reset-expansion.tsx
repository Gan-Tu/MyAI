"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState
} from "react";

// Define types for the context value
interface ResetExpansionContextValue {
  resetFlag: boolean;
  resetExpansion: () => void;
}

// Create the context
const ResetExpansionContext = createContext<
  ResetExpansionContextValue | undefined
>(undefined);

// Create the provider component
export const ResetExpansionProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [resetFlag, setResetFlag] = useState(false);

  const resetExpansion = useCallback(() => {
    setResetFlag(true);
    setTimeout(() => setResetFlag(false), 0); // Reset the flag after children process it
  }, []);

  return (
    <ResetExpansionContext.Provider value={{ resetFlag, resetExpansion }}>
      {children}
    </ResetExpansionContext.Provider>
  );
};

// Custom hook to use the context
export const useResetExpansion = (): ResetExpansionContextValue => {
  const context = useContext(ResetExpansionContext);
  if (!context) {
    throw new Error(
      "useResetExpansion must be used within a ResetExpansionProvider"
    );
  }
  return context;
};
