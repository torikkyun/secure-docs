"use client";

import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzYzUyYzM3LWFjNGUtNDJlYy04MDJiLTU1ODVjM2U5ZDNkNyIsInJvbGUiOnsibmFtZSI6InVzZXIifSwic2Vzc2lvbklkIjoiYTdhNjRjN2EtMDQ1Zi00ZDZkLWE3MTEtOGY5YTU5OGQyNGI1IiwiaWF0IjoxNzY0MDM5NTQzLCJleHAiOjE3NjQxMjU5NDN9.uHmgLtMAJRcbpXheZzCl5-4WYsOhZk_bOkLAiOQPLjM", // TODO: Add token handling
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
              <Input
                id="encryptedKeyGrantee"
                onChange={(e) => setEncryptedKeyGrantee(e.target.value)}
                placeholder="base64..."
                required
                value={encryptedKeyGrantee}
              />
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
