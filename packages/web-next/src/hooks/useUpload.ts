// Custom hooks for file upload functionality
import { useState } from "react";
import util from "tweetnacl-util";
import { KeyManager } from "@/lib/crypto/key-manager";

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

      // 1. Load User Identity (for encrypting the key)
      const identity = await KeyManager.loadIdentity();
      if (!identity) {
        throw new Error(
          "User identity not found. Please register/login first to generate keys."
        );
      }

      // 2. Generate AES-GCM key (File Key)
      const subtle = window.crypto.subtle;
      const aesKey = await subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // 3. Encrypt File Content
      const fileArrayBuffer = await file.arrayBuffer();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const cipherBuffer = await subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        fileArrayBuffer
      );

      // Prepend IV to ciphertext
      const cipherUint8 = new Uint8Array(cipherBuffer);
      const combined = new Uint8Array(iv.byteLength + cipherUint8.byteLength);
      combined.set(iv, 0);
      combined.set(cipherUint8, iv.byteLength);

      const encryptedFile = new File([combined], `${file.name}.enc`, {
        type: "application/octet-stream",
      });

      // 4. Upload Encrypted File to Pinata
      const form = new FormData();
      form.append("file", encryptedFile);

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

      // 5. Encrypt the AES Key for the Owner (Self) using KeyManager
      const exportedKey = await subtle.exportKey("raw", aesKey);
      const exportedKeyBase64 = util.encodeBase64(new Uint8Array(exportedKey));

      // Encrypt: Sender = Self, Recipient = Self
      const encryptedKeyOwner = KeyManager.encryptMessage(
        exportedKeyBase64,
        identity.publicKey,
        identity.privateKey
      );

      // 6. Send Metadata to Backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2412";

      const payload = {
        fileHash: `0x${cid.slice(0, 10)}`, // Mock hash if needed, or use CID
        cid,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || null,
        encryptedKeyOwner, // This is now the TweetNaCl encrypted box
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

      if (!backendRes.ok) {
        throw new Error(
          `Backend upload failed: ${backendRes.status} ${JSON.stringify(backendData)}`
        );
      }

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
