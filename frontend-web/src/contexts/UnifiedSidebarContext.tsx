"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { AccessGrant, File } from "@/types/api";

type SidebarContent =
  | { type: "file"; data: File }
  | { type: "share"; data: AccessGrant; shareType: "given" | "received" }
  | null;

type UnifiedSidebarContextType = {
  content: SidebarContent;
  isOpen: boolean;
  showFileDetails: (file: File) => void;
  showShareDetails: (
    grant: AccessGrant,
    shareType: "given" | "received"
  ) => void;
  closeSidebar: () => void;
};

const UnifiedSidebarContext = createContext<
  UnifiedSidebarContextType | undefined
>(undefined);

export function UnifiedSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<SidebarContent>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showFileDetails = useCallback((file: File) => {
    setContent({ type: "file", data: file });
    setIsOpen(true);
  }, []);

  const showShareDetails = useCallback(
    (grant: AccessGrant, shareType: "given" | "received") => {
      setContent({ type: "share", data: grant, shareType });
      setIsOpen(true);
    },
    []
  );

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    // Keep content for animation, clear after delay
    setTimeout(() => setContent(null), 300);
  }, []);

  return (
    <UnifiedSidebarContext.Provider
      value={{
        content,
        isOpen,
        showFileDetails,
        showShareDetails,
        closeSidebar,
      }}
    >
      {children}
    </UnifiedSidebarContext.Provider>
  );
}

export function useUnifiedSidebar() {
  const context = useContext(UnifiedSidebarContext);
  if (context === undefined) {
    throw new Error(
      "useUnifiedSidebar must be used within UnifiedSidebarProvider"
    );
  }
  return context;
}
