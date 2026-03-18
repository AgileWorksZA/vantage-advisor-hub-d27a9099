import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PageContextType {
  currentAdvisorInitials: string | null;
  setCurrentAdvisorInitials: (initials: string | null) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [currentAdvisorInitials, setCurrentAdvisorInitials] = useState<string | null>(null);

  return (
    <PageContext.Provider value={{ currentAdvisorInitials, setCurrentAdvisorInitials }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("usePageContext must be used within a PageContextProvider");
  }
  return context;
}
