import { createContext, useCallback, useContext, useState } from "react";
import { DriveFile, mockFiles } from "@/data/mockFiles";

type ViewMode = "grid" | "list";
type SortBy = "name" | "modified" | "size";
type SortOrder = "asc" | "desc";

interface DriveContextType {
  files: DriveFile[];
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedFiles: Set<string>;
  searchQuery: string;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleFileSelection: (fileId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleStarred: (fileId: string) => void;
  currentFolder: string;
  setCurrentFolder: (path: string) => void;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<DriveFile[]>(mockFiles);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("modified");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState("My Drive");

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const toggleStarred = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, starred: !file.starred } : file
      )
    );
  }, []);

  const sortedAndFilteredFiles = files
    .filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return (sortOrder === "asc" ? 1 : -1) * a.name.localeCompare(b.name);
      }
      if (sortBy === "modified") {
        return (
          (sortOrder === "asc" ? 1 : -1) *
          (new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime())
        );
      }
      return 0;
    });

  return (
    <DriveContext.Provider
      value={{
        files: sortedAndFilteredFiles,
        viewMode,
        sortBy,
        sortOrder,
        selectedFiles,
        searchQuery,
        setViewMode,
        setSortBy,
        setSortOrder,
        toggleFileSelection,
        setSearchQuery,
        toggleStarred,
        currentFolder,
        setCurrentFolder,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  const context = useContext(DriveContext);
  if (context === undefined) {
    throw new Error("useDrive must be used within a DriveProvider");
  }
  return context;
}
