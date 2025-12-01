"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { File } from "@/types/api";

type SelectedFileContextType = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const SelectedFileContext = createContext<SelectedFileContextType | undefined>(
  undefined
);

export function SelectedFileProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SelectedFileContext.Provider
      value={{ selectedFile, setSelectedFile, isLoading, setIsLoading }}
    >
      {children}
    </SelectedFileContext.Provider>
  );
}

export function useSelectedFile() {
  const context = useContext(SelectedFileContext);
  if (context === undefined) {
    throw new Error("useSelectedFile must be used within SelectedFileProvider");
  }
  return context;
}
