/**
 * File Upload Service - Tách biệt logic upload khỏi hooks
 * Xử lý encrypt, upload IPFS, và save metadata
 */

import { baseApiClient } from "@/lib/api/base.client";
import { encryptMessage } from "@/lib/crypto/key-manager";
import { fileEncryptionService } from "@/services/crypto/file-encryption.service";
import { identityService } from "@/services/crypto/identity.service";
import type { File as FileType } from "@/types/api";

export type UploadOptions = {
  pinataJwt: string;
  onProgress?: (progress: UploadProgress) => void;
};

export type UploadProgress = {
  stage: "encrypting" | "uploading" | "saving" | "complete";
  progress: number;
  message: string;
};

export type UploadResult = {
  file: FileType;
  cid: string;
};

/**
 * Upload file lên Pinata IPFS
 */
async function uploadToIPFS(
  encryptedFile: File,
  pinataJwt: string
): Promise<string> {
  const form = new FormData();
  form.append("file", encryptedFile);

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      body: form,
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.IpfsHash || data.ipfsHash || data.hash;
}

/**
 * Main upload function
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const { pinataJwt, onProgress } = options;

  // Stage 1: Load identity
  onProgress?.({
    stage: "encrypting",
    progress: 10,
    message: "Loading user identity...",
  });

  const identity = await identityService.load();
  if (!identity) {
    throw new Error(
      "User identity not found. Please register/login first to generate keys."
    );
  }

  // Stage 2: Generate AES key
  onProgress?.({
    stage: "encrypting",
    progress: 20,
    message: "Generating encryption key...",
  });

  const aesKey = await fileEncryptionService.generateKey();

  // Stage 3: Encrypt file
  onProgress?.({
    stage: "encrypting",
    progress: 40,
    message: "Encrypting file...",
  });

  const fileData = await file.arrayBuffer();
  const fileHash = await fileEncryptionService.hashFile(fileData);
  const encryptedData = await fileEncryptionService.encryptFile(
    fileData,
    aesKey
  );

  // Stage 4: Upload to IPFS
  onProgress?.({
    stage: "uploading",
    progress: 60,
    message: "Uploading to IPFS...",
  });

  const encryptedFile = new File(
    [encryptedData as unknown as Blob],
    `${file.name}.enc`,
    {
      type: "application/octet-stream",
    }
  );

  const cid = await uploadToIPFS(encryptedFile, pinataJwt);

  // Stage 5: Encrypt AES key for owner
  onProgress?.({
    stage: "saving",
    progress: 80,
    message: "Encrypting file key...",
  });

  const keyBase64 = await fileEncryptionService.exportKey(aesKey);
  const encryptedKeyOwner = encryptMessage(
    keyBase64,
    identity.publicKey,
    identity.privateKey
  );

  // Stage 6: Save metadata to backend
  onProgress?.({
    stage: "saving",
    progress: 90,
    message: "Saving metadata...",
  });

  const uploadedFile = await baseApiClient.post<FileType>("/api/files/upload", {
    fileHash,
    cid,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || null,
    encryptedKeyOwner,
    pinSize: encryptedFile.size,
    pinService: "pinata",
  });

  // Complete
  onProgress?.({
    stage: "complete",
    progress: 100,
    message: "Upload complete!",
  });

  return {
    file: uploadedFile,
    cid,
  };
}

/**
 * Check storage quota trước khi upload
 */
export function checkUploadQuota(fileSize: number): Promise<{
  canUpload: boolean;
  message?: string;
  remainingStorage?: string;
}> {
  return baseApiClient.post("/api/files/prepare-upload", { fileSize });
}
