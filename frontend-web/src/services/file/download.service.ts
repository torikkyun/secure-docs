/**
 * File Download Service - Xử lý download và decrypt files
 */

import { baseApiClient } from "@/lib/api/base.client";
import { fileEncryptionService } from "@/services/crypto/file-encryption.service";

export type DownloadOptions = {
  onProgress?: (progress: DownloadProgress) => void;
};

export type DownloadProgress = {
  stage: "requesting" | "fetching" | "decrypting" | "complete";
  progress: number;
  message: string;
};

export type DownloadResult = {
  blob: Blob;
  fileName: string;
  fileSize: number;
};

/**
 * Fetch file từ IPFS gateway
 */
async function fetchFromIPFS(cid: string): Promise<ArrayBuffer> {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.status}`);
  }

  return response.arrayBuffer();
}

/**
 * Main download function
 */
export async function downloadFile(
  fileId: string,
  options: DownloadOptions = {},
): Promise<DownloadResult> {
  const { onProgress } = options;

  try {
    // Stage 1: Request download
    onProgress?.({
      stage: "requesting",
      progress: 10,
      message: "Requesting file access...",
    });

    const downloadRequest = await baseApiClient.post<{
      downloadId: string;
      decryptedKey: string;
      cid: string;
      file: {
        fileName: string;
        fileSize: number;
        fileType: string;
      };
    }>("/api/downloads/request", { fileId });

    const { downloadId, decryptedKey, cid, file } = downloadRequest;

    // Stage 2: Fetch từ IPFS
    onProgress?.({
      stage: "fetching",
      progress: 40,
      message: "Downloading from IPFS...",
    });

    const encryptedData = await fetchFromIPFS(cid);

    // Stage 3: Decrypt file
    onProgress?.({
      stage: "decrypting",
      progress: 70,
      message: "Decrypting file...",
    });

    const aesKey = await fileEncryptionService.importKey(decryptedKey);
    const decryptedData = await fileEncryptionService.decryptFile(
      new Uint8Array(encryptedData),
      aesKey,
    );

    // Stage 4: Complete download
    onProgress?.({
      stage: "complete",
      progress: 90,
      message: "Finalizing...",
    });

    const blob = new Blob([decryptedData], { type: file.fileType });

    // Mark download as complete
    await baseApiClient.post(`/api/downloads/${downloadId}/complete`, {
      success: true,
    });

    onProgress?.({
      stage: "complete",
      progress: 100,
      message: "Download complete!",
    });

    return {
      blob,
      fileName: file.fileName,
      fileSize: file.fileSize,
    };
  } catch (error) {
    // Log error for debugging
    console.error("Download failed:", error);

    // Re-throw to let caller handle
    throw error instanceof Error ? error : new Error("Failed to download file");
  }
}

/**
 * Trigger browser download
 */
export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Combined download + trigger function
 */
export async function downloadAndSaveFile(
  fileId: string,
  options: DownloadOptions = {},
): Promise<void> {
  const result = await downloadFile(fileId, options);
  triggerBrowserDownload(result.blob, result.fileName);
}
