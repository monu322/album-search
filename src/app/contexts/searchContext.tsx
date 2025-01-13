"use client"
import { createContext, useContext, useState, ReactNode } from "react";

// Define types for context values
interface SearchContextType {
  artistId: string | null;
  setArtistId: (id: string) => void;
}

// Create the context with a default value
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component
export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [artistId, setArtistId] = useState<string | null>(null);

  return (
    <SearchContext.Provider value={{ artistId, setArtistId }}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook to use the context
export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
