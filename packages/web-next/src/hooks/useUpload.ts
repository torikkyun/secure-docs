// Custom hooks for file upload functionality
import { useState } from "react";

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Uploads a File to Pinata and then sends metadata to backend.
   * @param file File to upload
   * @param options.pinataJwt Pinata JWT for authentication
   * @param options.backendToken Optional backend Bearer token
   */
  const uploadFile = async (
    file: File,
    options: { pinataJwt: string; backendToken?: string }
  ) => {
    setIsUploading(true);
    try {
      if (!options?.pinataJwt) {
        throw new Error("Pinata JWT is required for pinning");
      }

      const form = new FormData();
      form.append("file", file);
      form.append(
        "pinataMetadata",
        JSON.stringify({
          name: file.name,
          keyvalues: { uploadedBy: "web-test" },
        })
      );

      const pinRes = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          body: form,
          headers: {
            Authorization: `Bearer ${options.pinataJwt}`,
          },
        }
      );

      if (!pinRes.ok) {
        const text = await pinRes.text();
        throw new Error(`Pinata upload failed: ${pinRes.status} ${text}`);
      }

      const pinData = await pinRes.json();
      const cid = pinData?.IpfsHash || pinData?.ipfsHash || pinData?.hash;

      // Prepare metadata payload for backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2412";

      const payload = {
        fileHash: `0x${cid.slice(0, 10)}`,
        cid,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || null,
        encryptedKeyOwner: "test_encrypted_key_dummy",
        kmsEncryptedKey: null,
        txHash: null,
        blockchainFileId: null,
        metadata: { pinnedFrom: "pinata", originalName: file.name },
      };

      const backendRes = await fetch(`${apiUrl}/api/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.backendToken
            ? { Authorization: `Bearer ${options.backendToken}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      const backendData = await backendRes.json().catch(() => null);

      setIsUploading(false);
      return {
        pinData,
        backend: { status: backendRes.status, body: backendData },
      };
    } catch (err) {
      setIsUploading(false);
      throw err;
    }
  };

  return { isUploading, uploadFile };
};
