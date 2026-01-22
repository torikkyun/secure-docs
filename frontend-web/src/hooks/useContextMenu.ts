// Custom hook for handling context menu interactions
import { useState } from "react";

export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    setIsOpen(true);
    setPosition({ x: e.clientX, y: e.clientY });
    setSelectedFile(fileId);
  };

  const closeContextMenu = () => {
    setIsOpen(false);
    setSelectedFile(null);
  };

  return {
    isOpen,
    position,
    selectedFile,
    handleContextMenu,
    closeContextMenu,
  };
};
