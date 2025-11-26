"use client";

import React, { useState } from "react";
import { useUpload } from "@/hooks/useUpload";

export default function UploadTestPage() {
  const { isUploading, uploadFile } = useUpload();
  const [file, setFile] = useState<File | null>(null);
  const [pinataJwt, setPinataJwt] = useState("");
  const [backendToken, setBackendToken] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [cid, setCid] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [fileType, setFileType] = useState("");
  const [encryptedKeyOwner, setEncryptedKeyOwner] = useState("");
  const [pinSize, setPinSize] = useState<number | undefined>(undefined);
  const [pinService, setPinService] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("Please select a file");
      return;
    }
    try {
      const buildMetadata = () => ({
        fileHash: fileHash || undefined,
        cid: cid || undefined,
        fileName: fileName || file.name,
        fileSize: fileSize ?? file.size,
        fileType: fileType || file.type,
        encryptedKeyOwner: encryptedKeyOwner || undefined,
        pinSize: pinSize ?? file.size,
        pinService: pinService || undefined,
      });

      const opts = {
        pinataJwt,
        backendToken: backendToken || undefined,
        metadata: buildMetadata(),
      } as unknown as Parameters<typeof uploadFile>[1];

      const res = await uploadFile(file, opts);
      setResult(res as Record<string, unknown>);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Unknown error");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Upload Test (Pinata)</h1>
      <p>
        Provide a Pinata JWT and optional backend Bearer token to test upload.
      </p>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="pinataJwt">Pinata JWT (required)</label>
          <br />
          <input
            id="pinataJwt"
            onChange={(e) => setPinataJwt(e.target.value)}
            style={{ width: "100%" }}
            type="text"
            value={pinataJwt}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="backendToken">Backend Bearer Token (optional)</label>
          <br />
          <input
            id="backendToken"
            onChange={(e) => setBackendToken(e.target.value)}
            style={{ width: "100%" }}
            type="text"
            value={backendToken}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="fileHash">File Hash (optional)</label>
          <br />
          <input
            id="fileHash"
            onChange={(e) => setFileHash(e.target.value)}
            style={{ width: "100%" }}
            type="text"
            value={fileHash}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="cid">CID (optional)</label>
          <br />
          <input
            id="cid"
            onChange={(e) => setCid(e.target.value)}
            style={{ width: "100%" }}
            type="text"
            value={cid}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="fileInput">Select file</label>
          <br />
          <input
            id="fileInput"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f) {
                setFileName(f.name);
                setFileSize(f.size);
                setFileType(f.type);
                setPinSize(f.size);
              } else {
                setFileName("");
                setFileSize(undefined);
                setFileType("");
                setPinSize(undefined);
              }
            }}
            type="file"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="fileName">File Name</label>
          <br />
          <input
            id="fileName"
            onChange={(e) => setFileName(e.target.value)}
            style={{ width: "100%" }}
            type="text"
            value={fileName}
          />
        </div>

        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="fileSize">File Size (bytes)</label>
            <br />
            <input
              id="fileSize"
              onChange={(e) => setFileSize(Number(e.target.value) || undefined)}
              style={{ width: "100%" }}
              type="number"
              value={fileSize ?? ""}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="fileType">File Type</label>
            <br />
            <input
              id="fileType"
              onChange={(e) => setFileType(e.target.value)}
              style={{ width: "100%" }}
              type="text"
              value={fileType}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="encryptedKeyOwner">Encrypted Key (owner)</label>
          <br />
          <input
            id="encryptedKeyOwner"
            onChange={(e) => setEncryptedKeyOwner(e.target.value)}
            style={{ width: "100%" }}
            type="text"
            value={encryptedKeyOwner}
          />
        </div>

        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="pinSize">Pin Size (bytes)</label>
            <br />
            <input
              id="pinSize"
              onChange={(e) => setPinSize(Number(e.target.value) || undefined)}
              style={{ width: "100%" }}
              type="number"
              value={pinSize ?? ""}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="pinService">Pin Service</label>
            <br />
            <input
              id="pinService"
              onChange={(e) => setPinService(e.target.value)}
              style={{ width: "100%" }}
              type="text"
              value={pinService}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <button disabled={isUploading} type="submit">
            {isUploading ? "Uploading..." : "Upload to Pinata"}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ color: "red", marginTop: 12 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>Result</h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f6f6f6",
              padding: 12,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
