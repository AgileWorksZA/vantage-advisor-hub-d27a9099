import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type AppMode = "web" | "mobile";

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  showSplash: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

const STORAGE_KEY = "vantage-app-mode";

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "mobile" ? "mobile" : "web";
  });
  const [showSplash, setShowSplash] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "mobile";
  });

  const setMode = useCallback((newMode: AppMode) => {
    localStorage.setItem(STORAGE_KEY, newMode);
    if (newMode === "mobile") {
      setShowSplash(true);
      setModeState(newMode);
      setTimeout(() => setShowSplash(false), 3000);
    } else {
      setShowSplash(false);
      setModeState(newMode);
    }
  }, []);

  // On initial load, if mode is mobile, show splash for 3s
  useState(() => {
    if (mode === "mobile") {
      setTimeout(() => setShowSplash(false), 3000);
    }
  });

  return (
    <AppModeContext.Provider value={{ mode, setMode, showSplash }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
}
