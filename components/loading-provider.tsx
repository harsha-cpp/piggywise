"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Image from "next/image";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('has_visited_piggywise');
    
    if (hasVisited) {
      // Even if already visited, still show loading for 2 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } else {
      // First visit, show loading screen for longer
      setTimeout(() => {
        setIsLoading(false);
        localStorage.setItem('has_visited_piggywise', 'true');
      }, 3500); // 3.5 second loading screen for first time
    }
  }, []);
  
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src="/peppapig.png"
                alt="Piggywise Logo"
                fill
                className="object-contain animate-pulse"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-800">Piggywise</h1>
            <p className="text-gray-600 mb-4">Teaching kids financial literacy</p>
            <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 animate-loading"></div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}; 