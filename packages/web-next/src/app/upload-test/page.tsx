"use client";

import React, { useState } from "react";
import { useUpload } from "@/hooks/useUpload";

export default function UploadTestPage() {
  const { isUploading, uploadFile } = useUpload();
  const [file, setFile] = useState<File | null>(null);
  const [pinataJwt, setPinataJwt] = useState("");
  const [backendToken, setBackendToken] = useState("");
  const [result, setResult] = useState<unknown>(null);
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
      const res = await uploadFile(file, {
        pinataJwt,
        backendToken: backendToken || undefined,
      });
      setResult(res);
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
          <label htmlFor="fileInput">Select file</label>
          <br />
          <input
            id="fileInput"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            type="file"
          />
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
