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
   * 6. Creating blockchain transaction
   * 7. Creating access grant in backend
   */
  const shareFile = async (params: {
    fileId: string;
    fileDetails: {
      encryptedKeyOwner: string;
      cid: string;
    };
    recipientWalletAddress: string;
    recipientPublicKey: string;
    contractAddress: string;
    expiresAt?: string;
    onProgress?: (step: string) => void;
  }) => {
    const {
      fileId,
      fileDetails,
      recipientWalletAddress,
      recipientPublicKey,
      contractAddress,
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

      // Step 2: Prepare SIWE-compliant message and sign FIRST (better UX)
      onProgress?.("Preparing signature request...");
      const domain = window.location.host;
      const issuedAt = new Date().toISOString();
      const nonce = Math.random().toString(36).substring(2, 15);

      // SIWE-compliant message format
      const siweMessage = `${domain} wants you to sign in with your Ethereum account:
${identity.publicKey}

Grant file access to: ${recipientWalletAddress}

URI: ${window.location.origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${issuedAt}
Resources:
- ipfs://${fileDetails.cid}`;

      onProgress?.("Waiting for signature...");
      const { signMessage } = await import("wagmi/actions");
      const { config } = await import("@/lib/wagmi-config");
      const signature = await signMessage(config, { message: siweMessage });

      // Step 3: Decrypt file key
      onProgress?.("Decrypting file key...");
      console.log("Decrypting with:", {
        encryptedKeyOwner: `${fileDetails.encryptedKeyOwner?.substring(0, 50)}...`,
        ownerPublicKey: `${identity.publicKey?.substring(0, 50)}...`,
      });

      const aesKeyBase64 = decryptMessage(
        fileDetails.encryptedKeyOwner,
        identity.publicKey, // Sender is owner (self)
        identity.privateKey // Receiver is owner (self)
      );

      if (!aesKeyBase64) {
        throw new Error(
          "Failed to decrypt file key. You may not be the owner."
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
        identity.privateKey // Sender's private key (owner)
      );

      if (!encryptedKeyGrantee) {
        throw new Error(
          "Failed to encrypt key for recipient. Invalid public key format."
        );
      }

      // Step 4: Create blockchain transaction (non-blocking)
      onProgress?.("Submitting to blockchain...");
      const { writeContract } = await import("wagmi/actions");
      const { FileShareABI } = await import("@/abis/FileShareABI");

      const hash = await writeContract(config, {
        address: contractAddress as `0x${string}`,
        abi: FileShareABI,
        functionName: "shareFile",
        args: [recipientWalletAddress as `0x${string}`, fileDetails.cid],
      });

      // Step 5: Save to backend immediately (don't wait for confirmation)
      onProgress?.("Saving access grant...");
      const backendToken = localStorage.getItem("auth_token");
      if (!backendToken) {
        throw new Error("Authentication token not found");
      }

      await accessGrantApi.create({
        fileId,
        granteeWalletAddress: recipientWalletAddress,
        encryptedKeyGrantee,
        txHash: hash,
        signature,
        expiresAt,
      });

      // Fire-and-forget: Wait for confirmation in background
      const { waitForTransactionReceipt } = await import("wagmi/actions");
      waitForTransactionReceipt(config, { hash })
        .then(() => {
          console.log("✅ Blockchain confirmation received:", hash);
        })
        .catch((err) => {
          console.error("⚠️ Blockchain confirmation failed:", err);
        });

      onProgress?.("Share completed successfully!");
      setIsSharing(false);
      return { success: true, txHash: hash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Share failed";
      setError(errorMessage);
      setIsSharing(false);
      throw new Error(errorMessage);
    }
  };

  return { isSharing, error, shareFile };
};
