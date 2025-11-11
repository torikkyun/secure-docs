// Custom hooks for file upload functionality
import { useState } from "react";

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    // Will be implemented in step 4
    setIsUploading(true);
    // Mock upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUploading(false);
  };

  return { isUploading, uploadFile };
};
