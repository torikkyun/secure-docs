"use client";

import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyManager } from "@/lib/crypto/key-manager";
import { FileShareABI } from "../../abis/FileShareABI";

export default function ShareTestPage() {
  const [contractAddress, setContractAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [cid, setCid] = useState("");
  const [fileId, setFileId] = useState("");
  const [encryptedKeyGrantee, setEncryptedKeyGrantee] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [apiStatus, setApiStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(contractAddress && recipient && cid)) {
      return;
    }

    setApiStatus(null);
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: FileShareABI,
      functionName: "shareFile",
      args: [recipient as `0x${string}`, cid],
    });
  };

  const generateEncryptedKey = async () => {
    if (!(fileId && recipient)) {
      setApiStatus({
        success: false,
        message: "Please enter File ID and Recipient Address first",
      });
      return;
    }

    try {
      setApiStatus({ success: false, message: "Generating encrypted key..." });

      // 1. Load owner's identity
      const identity = await KeyManager.loadIdentity();
      if (!identity) {
        throw new Error("Identity not found. Please login first.");
      }

      // 2. Fetch file details to get encryptedKeyOwner
      const fileRes = await fetch(`http://localhost:3001/api/files/${fileId}`, {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ1MjBiNDM4LWNkZmItNGJmMy1iNTNkLTQyZmJlNjMxMjY3YyIsInJvbGUiOnsibmFtZSI6InVzZXIifSwic2Vzc2lvbklkIjoiNzU0MWFjODctY2JiMi00NmVlLTlmNWEtZjJlZDdkMWMwNDg3IiwiaWF0IjoxNzY0MTY4NDQyLCJleHAiOjE3NjQyNTQ4NDJ9.GL63lnwhdFJ5WHFYGZE2zv_-Kb_ZyqScmvCIjroyDfw",
        },
      });

      if (!fileRes.ok) {
        throw new Error(`Failed to fetch file: ${fileRes.statusText}`);
      }

      const fileData = await fileRes.json();
      console.log(fileData);
      const encryptedKeyOwner = fileData.data.file.encryptedKeyOwner;

      if (!encryptedKeyOwner) {
        throw new Error("File does not have encryptedKeyOwner");
      }

      // 3. Decrypt encryptedKeyOwner to get AES key
      // encryptedKeyOwner is encrypted with owner's own public key
      const aesKeyBase64 = KeyManager.decryptMessage(
        encryptedKeyOwner,
        identity.publicKey, // Sender is owner (self)
        identity.privateKey // Receiver is owner (self)
      );

      if (!aesKeyBase64) {
        throw new Error(
          "Failed to decrypt file key. You may not be the owner."
        );
      }

      // 4. Fetch grantee's public key from backend
      const userRes = await fetch(
        `http://localhost:3001/api/users/wallet/${recipient}`,
        {
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ1MjBiNDM4LWNkZmItNGJmMy1iNTNkLTQyZmJlNjMxMjY3YyIsInJvbGUiOnsibmFtZSI6InVzZXIifSwic2Vzc2lvbklkIjoiNzU0MWFjODctY2JiMi00NmVlLTlmNWEtZjJlZDdkMWMwNDg3IiwiaWF0IjoxNzY0MTY4NDQyLCJleHAiOjE3NjQyNTQ4NDJ9.GL63lnwhdFJ5WHFYGZE2zv_-Kb_ZyqScmvCIjroyDfw",
          },
        }
      );

      if (!userRes.ok) {
        throw new Error(`Failed to fetch grantee user: ${userRes.statusText}`);
      }

      const userData = await userRes.json();
      console.log(userData);
      const granteePublicKey = userData.data.publicKey;

      if (!granteePublicKey) {
        throw new Error("Grantee does not have a public key");
      }

      // 5. Re-encrypt AES key for grantee
      const encryptedKeyForGrantee = KeyManager.encryptMessage(
        aesKeyBase64,
        granteePublicKey, // Recipient's public key
        identity.privateKey // Sender's private key (owner)
      );

      setEncryptedKeyGrantee(encryptedKeyForGrantee);
      setApiStatus({
        success: true,
        message: "Encrypted key generated successfully!",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setApiStatus({
        success: false,
        message: `Error: ${errorMessage}`,
      });
    }
  };

  const syncWithApi = async () => {
    if (!hash) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/access-grants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ1MjBiNDM4LWNkZmItNGJmMy1iNTNkLTQyZmJlNjMxMjY3YyIsInJvbGUiOnsibmFtZSI6InVzZXIifSwic2Vzc2lvbklkIjoiNzU0MWFjODctY2JiMi00NmVlLTlmNWEtZjJlZDdkMWMwNDg3IiwiaWF0IjoxNzY0MTY4NDQyLCJleHAiOjE3NjQyNTQ4NDJ9.GL63lnwhdFJ5WHFYGZE2zv_-Kb_ZyqScmvCIjroyDfw", // TODO: Add token handling
        },
        body: JSON.stringify({
          fileId,
          granteeWalletAddress: recipient,
          encryptedKeyGrantee,
          txHash: hash,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setApiStatus({
          success: true,
          message: `API Sync Successful: ${data.message}`,
        });
      } else {
        setApiStatus({
          success: false,
          message: `API Error: ${data.message || "Unknown error"}`,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setApiStatus({
        success: false,
        message: `Network Error: ${errorMessage}`,
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Test File Share Contract & API</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="contractAddress">Contract Address</Label>
              <Input
                id="contractAddress"
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                required
                value={contractAddress}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                required
                value={recipient}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cid">CID (File Hash)</Label>
              <Input
                id="cid"
                onChange={(e) => setCid(e.target.value)}
                placeholder="Qm..."
                required
                value={cid}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileId">File ID (UUID)</Label>
              <Input
                id="fileId"
                onChange={(e) => setFileId(e.target.value)}
                placeholder="uuid..."
                required
                value={fileId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryptedKeyGrantee">
                Encrypted Key for Grantee
              </Label>
              <div className="flex gap-2">
                <Input
                  id="encryptedKeyGrantee"
                  onChange={(e) => setEncryptedKeyGrantee(e.target.value)}
                  placeholder="Click 'Generate' to auto-fill..."
                  readOnly
                  value={encryptedKeyGrantee}
                />
                <Button
                  onClick={generateEncryptedKey}
                  type="button"
                  variant="secondary"
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                onChange={(e) => setExpiresAt(e.target.value)}
                type="datetime-local"
                value={expiresAt}
              />
            </div>

            <Button
              className="w-full"
              disabled={isPending || isConfirming}
              type="submit"
            >
              {(() => {
                if (isPending) {
                  return "Confirming...";
                }
                if (isConfirming) {
                  return "Processing...";
                }
                return "Share File (Blockchain)";
              })()}
            </Button>

            {hash && (
              <div className="mt-4 break-all rounded-md bg-muted p-4">
                <p className="font-medium text-sm">Transaction Hash:</p>
                <p className="text-muted-foreground text-xs">{hash}</p>
              </div>
            )}

            {isConfirmed && (
              <div className="mt-4 rounded-md bg-green-100 p-4 text-green-800">
                <p>Transaction Confirmed!</p>
                <Button
                  className="mt-2 w-full border-green-800 text-green-800 hover:bg-green-200"
                  onClick={syncWithApi}
                  type="button"
                  variant="outline"
                >
                  Sync with API
                </Button>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md bg-red-100 p-4 text-red-800">
                Error: {error.message}
              </div>
            )}

            {apiStatus && (
              <div
                className={`mt-4 rounded-md p-4 ${apiStatus.success ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}
              >
                {apiStatus.message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
