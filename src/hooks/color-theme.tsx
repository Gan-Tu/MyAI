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
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

const allThemes = [
  "bg-blue-100",
  "bg-sky-100",
  "bg-green-100",
  "bg-orange-100",
  "bg-pink-100",
  "bg-red-100",
  "bg-rose-100",
  "bg-violet-100",
];

// Define the type for the context value
interface ColorThemeContextTypeValue {
  colorTheme: string;
  setColorTheme: Dispatch<SetStateAction<string>>;
  allThemes: string[];
}

// Create the Context with a default undefined value
const ColorThemeContext = createContext<ColorThemeContextTypeValue | undefined>(
  undefined,
);

// Define the Props type for the provider
interface ColorThemeProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const ColorThemeProvider: React.FC<ColorThemeProviderProps> = ({
  children,
}) => {
  const [colorTheme, setColorTheme] = useState<string>("bg-blue-100");

  return (
    <ColorThemeContext.Provider
      value={{ colorTheme, setColorTheme, allThemes }}
    >
      {children}
    </ColorThemeContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useColorTheme = (): ColorThemeContextTypeValue => {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};
