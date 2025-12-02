import { useState } from "react";
import { accessGrantApi } from "@/lib/api";
import { KeyManager } from "@/lib/crypto/key-manager";

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
      const identity = await KeyManager.loadIdentity();
      if (!identity) {
        throw new Error("Identity not found. Please login first.");
      }

      // Step 2: Decrypt file key (encryptedKeyOwner)
      onProgress?.("Decrypting file key...");
      const aesKeyBase64 = KeyManager.decryptMessage(
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
      const encryptedKeyGrantee = KeyManager.encryptMessage(
        aesKeyBase64,
        recipientPublicKey, // Recipient's public key
        identity.privateKey // Sender's private key (owner)
      );

      // Step 4: Create blockchain transaction
      onProgress?.("Creating blockchain transaction...");
      const { writeContract } = await import("wagmi/actions");
      const { config } = await import("@/lib/wagmi-config");
      const { FileShareABI } = await import("@/abis/FileShareABI");

      const hash = await writeContract(config, {
        address: contractAddress as `0x${string}`,
        abi: FileShareABI,
        functionName: "shareFile",
        args: [recipientWalletAddress as `0x${string}`, fileDetails.cid],
      });

      // Step 5: Wait for transaction confirmation
      onProgress?.("Waiting for blockchain confirmation...");
      const { waitForTransactionReceipt } = await import("wagmi/actions");
      await waitForTransactionReceipt(config, { hash });

      // Step 6: Create access grant in backend
      onProgress?.("Creating access grant...");
      const backendToken = localStorage.getItem("auth_token");
      if (!backendToken) {
        throw new Error("Authentication token not found");
      }

      await accessGrantApi.create({
        fileId,
        granteeWalletAddress: recipientWalletAddress,
        encryptedKeyGrantee,
        txHash: hash,
        signature: "", // TODO: Implement signature if needed
        expiresAt,
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
