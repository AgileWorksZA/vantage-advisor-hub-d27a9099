import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type AppMode = "web" | "adviser" | "client";

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
    if (stored === "mobile" || stored === "adviser") return "adviser";
    if (stored === "client") return "client";
    return "web";
  });
  const [showSplash, setShowSplash] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "mobile" || stored === "adviser" || stored === "client";
  });

  const setMode = useCallback((newMode: AppMode) => {
    localStorage.setItem(STORAGE_KEY, newMode);
    if (newMode === "adviser" || newMode === "client") {
      setShowSplash(true);
      setModeState(newMode);
      setTimeout(() => setShowSplash(false), 3000);
    } else {
      setShowSplash(false);
      setModeState(newMode);
    }
  }, []);

  // On initial load, if mode is adviser/client, show splash for 3s
  useState(() => {
    if (mode === "adviser" || mode === "client") {
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
