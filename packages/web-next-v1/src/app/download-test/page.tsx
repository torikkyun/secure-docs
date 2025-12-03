"use client";

import { useState } from "react";
import util from "tweetnacl-util";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyManager } from "@/lib/crypto/key-manager";

export default function DownloadTestPage() {
  const [fileId, setFileId] = useState("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const addLog = (msg: string) => {
    setStatus((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileId) return;

    setIsDownloading(true);
    setError(null);
    setStatus("Starting download process...");

    try {
      // 1. Load Identity
      addLog("Loading user identity...");
      const identity = await KeyManager.loadIdentity();
      if (!identity) {
        throw new Error("Identity not found. Please login first.");
      }

      // 2. Request Download Metadata
      addLog("Requesting download metadata from API...");
      const requestRes = await fetch(
        "http://localhost:3001/api/downloads/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFlMzgxYzFlLTkxZTctNGZhMC1iYzE1LThhYWM4ZTk5NTYwMyIsInJvbGUiOnsibmFtZSI6InVzZXIifSwic2Vzc2lvbklkIjoiM2FkNDQwMjMtYzAzNy00NzFiLWFhNGYtZWZjZGFmMWY2OTkxIiwiaWF0IjoxNzY0Mjk3OTY2LCJleHAiOjE3NjQzODQzNjZ9.VLun1Gvr_oS1PWymg0BC5hR5El3lW1aFMtknUfDwYNo", // TODO: Add token
          },
          body: JSON.stringify({ fileId }),
        }
      );

      if (!requestRes.ok) {
        const errData = await requestRes.json();
        throw new Error(errData.message || "Failed to request download");
      }

      const {
        data: {
          downloadId,
          cid,
          encryptedKey,
          ownerPublicKey,
          fileName,
          fileType,
        },
      } = await requestRes.json();

      addLog(`Metadata received. CID: ${cid}`);

      // 3. Fetch Encrypted File from IPFS
      addLog("Fetching encrypted file from IPFS Gateway...");
      // Using a public gateway for demo, or local if configured
      const gateway =
        "https://silver-charming-reindeer-567.mypinata.cloud/ipfs";
      const ipfsRes = await fetch(`${gateway}/${cid}`);

      if (!ipfsRes.ok) {
        throw new Error(`Failed to fetch from IPFS: ${ipfsRes.statusText}`);
      }

      const encryptedFileBuffer = await ipfsRes.arrayBuffer();
      addLog(`File fetched. Size: ${encryptedFileBuffer.byteLength} bytes`);

      // 4. Decrypt the File Key
      addLog("Decrypting file key...");

      // The encryptedKey is a Box (nonce + ciphertext) encrypted with:
      // Sender: Owner (or Grantor)
      // Recipient: User (Grantee/Self)

      // We need the Sender's Public Key.
      // If we are the owner, sender is us. If grantee, sender is owner.
      // The API returns ownerPublicKey.
      // NOTE: If this is a grant, the key might be re-encrypted by the grantor.
      // In our current simple model, we might need to handle who encrypted it.
      // For now, assuming direct owner-to-user or owner-to-self where we have the key.

      // Wait, in `KeyManager.encryptMessage`, we used `nacl.box`.
      // To decrypt, we need `nacl.box.open`.
      // We need the sender's public key.
      // If I am the owner downloading my own file, sender is ME.
      // If I am a grantee, the key was encrypted by the Grantor (Owner).
      // So `ownerPublicKey` returned by API should be the sender's key.

      addLog(`Encrypted key: ${encryptedKey}`);
      addLog(`Owner public key: ${ownerPublicKey}`);
      addLog(`My public key: ${identity.publicKey}`);
      addLog(`My private key: ${identity.privateKey}`);

      if (ownerPublicKey === identity.publicKey) {
        addLog("INFO: You are the owner (Keys match).");
      } else {
        addLog("INFO: You are NOT the owner or keys do not match.");
      }

      const decryptedKeyBase64 = KeyManager.decryptMessage(
        encryptedKey,
        ownerPublicKey, // Sender's public key
        identity.privateKey // My private key
      );

      if (!decryptedKeyBase64) {
        throw new Error(
          "Failed to decrypt file key. Permission denied or wrong key."
        );
      }

      const aesKeyRaw = util.decodeBase64(decryptedKeyBase64);
      addLog("File key decrypted successfully.");

      // 5. Decrypt File Content (AES-GCM)
      addLog("Decrypting file content...");

      // Extract IV (first 12 bytes) and Ciphertext
      const iv = encryptedFileBuffer.slice(0, 12);
      const ciphertext = encryptedFileBuffer.slice(12);

      const subtle = window.crypto.subtle;
      const aesKey = await subtle.importKey(
        "raw",
        aesKeyRaw,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const decryptedBuffer = await subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        aesKey,
        ciphertext
      );

      addLog("File content decrypted.");

      // 6. Trigger Download
      const blob = new Blob([decryptedBuffer], {
        type: fileType || "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addLog("Download triggered.");

      // 7. Complete Download API
      addLog("Confirming download completion...");
      await fetch(
        `http://localhost:3001/api/downloads/${downloadId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFlMzgxYzFlLTkxZTctNGZhMC1iYzE1LThhYWM4ZTk5NTYwMyIsInJvbGUiOnsibmFtZSI6InVzZXIifSwic2Vzc2lvbklkIjoiM2FkNDQwMjMtYzAzNy00NzFiLWFhNGYtZWZjZGFmMWY2OTkxIiwiaWF0IjoxNzY0Mjk3OTY2LCJleHAiOjE3NjQzODQzNjZ9.VLun1Gvr_oS1PWymg0BC5hR5El3lW1aFMtknUfDwYNo", // TODO: Add token
          },
          body: JSON.stringify({
            success: true,
            bytesDownloaded: decryptedBuffer.byteLength,
          }),
        }
      );

      addLog("Download flow completed successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      addLog(`ERROR: ${err.message}`);

      // Try to report failure if we have a downloadId (not implemented here for simplicity scope)
    } finally {
      setIsDownloading(false);
    }
  };

  const [mnemonic, setMnemonic] = useState("");

  const handleRecover = async () => {
    if (!mnemonic) return;
    try {
      addLog("Recovering identity from mnemonic...");
      const identity = await KeyManager.recoverIdentity(mnemonic);
      await KeyManager.saveIdentity(identity);
      addLog(`Identity recovered! Public Key: ${identity.publicKey}`);
      alert("Identity recovered successfully!");
    } catch (err: any) {
      console.error(err);
      addLog(`Recovery failed: ${err.message}`);
      alert(`Recovery failed: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-10">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Recover Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mnemonic">Mnemonic Phrase</Label>
            <Input
              id="mnemonic"
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter 12-word mnemonic..."
              value={mnemonic}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleRecover}
            variant="secondary"
          >
            Recover Identity
          </Button>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Secure File Download Test</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleDownload}>
            <div className="space-y-2">
              <Label htmlFor="fileId">File ID (UUID)</Label>
              <Input
                id="fileId"
                onChange={(e) => setFileId(e.target.value)}
                placeholder="Enter File ID..."
                required
                value={fileId}
              />
            </div>

            <Button className="w-full" disabled={isDownloading} type="submit">
              {isDownloading ? "Processing..." : "Start Secure Download"}
            </Button>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="mt-4 h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 font-mono text-slate-50 text-xs">
              {status || "Ready to download..."}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
