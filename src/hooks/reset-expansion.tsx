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
