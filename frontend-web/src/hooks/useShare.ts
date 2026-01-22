import { useState } from "react";
import { accessGrantApi } from "@/lib/api";
import {
  decryptMessage,
  encryptMessage,
  loadIdentity,
} from "@/lib/crypto/key-manager";

export const useShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Shares a file with a recipient by:
   * 1. Loading owner's identity
   * 2. Fetching file's encryptedKeyOwner
   * 3. Decrypting the file key
   * 4. Fetching recipient's public key
   * 5. Re-encrypting for recipient
   * 6. Creating access grant in backend
   */
  const shareFile = async (params: {
    fileId: string;
    fileDetails: {
      encryptedKeyOwner: string;
    };
    recipientEmail: string;
    recipientPublicKey: string;
    passcode: string;
    expiresAt?: string;
    onProgress?: (step: string) => void;
  }) => {
    const {
      fileId,
      fileDetails,
      recipientEmail,
      recipientPublicKey,
      passcode,
      expiresAt,
      onProgress,
    } = params;

    setIsSharing(true);
    setError(null);

    try {
      // Step 1: Load owner's identity
      onProgress?.("Loading identity...");
      const identity = await loadIdentity();
      if (!identity) {
        throw new Error("Identity not found. Please login first.");
      }

      // Step 2: Decrypt file key
      onProgress?.("Decrypting file key...");
      console.log("Decrypting with:", {
        encryptedKeyOwner: `${fileDetails.encryptedKeyOwner?.substring(0, 50)}...`,
        ownerPublicKey: `${identity.publicKey?.substring(0, 50)}...`,
      });

      const aesKeyBase64 = decryptMessage(
        fileDetails.encryptedKeyOwner,
        identity.publicKey, // Sender is owner (self)
        identity.privateKey, // Receiver is owner (self)
      );

      if (!aesKeyBase64) {
        throw new Error(
          "Failed to decrypt file key. You may not be the owner.",
        );
      }

      // Step 3: Re-encrypt for recipient
      onProgress?.("Encrypting key for recipient...");
      console.log("Re-encrypting for recipient:", {
        recipientPublicKey: `${recipientPublicKey?.substring(0, 50)}...`,
        aesKeyLength: aesKeyBase64?.length,
      });

      const encryptedKeyGrantee = encryptMessage(
        aesKeyBase64,
        recipientPublicKey, // Recipient's public key
        identity.privateKey, // Sender's private key (owner)
      );

      if (!encryptedKeyGrantee) {
        throw new Error(
          "Failed to encrypt key for recipient. Invalid public key format.",
        );
      }

      // Step 4: Save to backend
      onProgress?.("Saving access grant...");
      const backendToken = localStorage.getItem("auth_token");
      if (!backendToken) {
        throw new Error("Authentication token not found");
      }

      await accessGrantApi.create({
        fileId,
        granteeEmail: recipientEmail,
        encryptedKeyGrantee,
        expiresAt,
        passcode,
      });

      onProgress?.("completed");
      setIsSharing(false);
      return { success: true };
    } catch (err) {
      console.error("Share error:", err);
      const errorMessage = err instanceof Error ? err.message : "Share failed";
      setError(errorMessage);
      setIsSharing(false);
      throw err; // Re-throw so component can handle it
    }
  };

  return { isSharing, error, shareFile };
};
