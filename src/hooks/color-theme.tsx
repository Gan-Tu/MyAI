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
