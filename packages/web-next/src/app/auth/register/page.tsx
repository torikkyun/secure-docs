"use client";
import { ethers } from "ethers";
import React, { useState } from "react";
import { SiweMessage } from "siwe";

export default function RegisterPage() {
  const [form, setForm] = useState({
    walletAddress: "",
    username: "",
    email: "",
    message: "",
    signature: "",
  });
  const [loading, setLoading] = useState(false);
  type Result = { status?: number; body?: unknown; error?: string } | null;
  const [result, setResult] = useState<Result>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        walletAddress: form.walletAddress,
        username: form.username,
        email: form.email,
        message: form.message,
        signature: form.signature,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}) as unknown);
      setResult({ status: res.status, body: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setResult({ error: message });
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const eth = (
        window as unknown as {
          ethereum?: { request: (...args: unknown[]) => Promise<unknown> };
        }
      ).ethereum;
      if (!eth) {
        setResult({ error: "MetaMask not detected in window.ethereum" });
        return;
      }
      const accountsRaw = await eth.request({ method: "eth_requestAccounts" });
      const accounts = accountsRaw as string[];
      if (accounts && accounts.length > 0) {
        try {
          const account = ethers.getAddress(accounts[0]);
          setForm((s) => ({ ...s, walletAddress: account }));
          prefillSiweMessage(account);
        } catch (err) {
          setResult({
            error: "Connected account is not a valid Ethereum address",
          });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setResult({ error: message });
    }
  };

  async function prefillSiweMessage(account: string) {
    try {
      const checksummed = (() => {
        try {
          return ethers.getAddress(account);
        } catch {
          return account;
        }
      })();
      const nonceRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/nonce/${checksummed}`
      );
      if (!nonceRes.ok) {
        return;
      }
      const nonceBody = (await nonceRes.json()) as any;
      const nonce =
        nonceBody?.nonce ??
        nonceBody?.value?.nonce ??
        nonceBody?.data?.nonce ??
        null;
      if (!nonce) return; // nothing we can do here
      const issuedAt =
        nonceBody?.issuedAt ??
        nonceBody?.value?.issuedAt ??
        new Date().toISOString();
      const expiresAt =
        nonceBody?.expiresAt ??
        nonceBody?.value?.expiresAt ??
        new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const siweMessage = new SiweMessage({
        domain: window.location.hostname || "secure-docs.example.com",
        address: checksummed,
        statement: "Register wallet for Secure Docs",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt,
        expirationTime: expiresAt,
      });
      const messageToSign = siweMessage.prepareMessage();
      setForm((s) => ({ ...s, message: messageToSign }));
    } catch (err) {
      // ignore errors here; user can still click Sign Message
      /* eslint-disable no-console */
      console.debug(err);
      /* eslint-enable no-console */
    }
  }

  const signMessage = async () => {
    try {
      const eth = (
        window as unknown as {
          ethereum?: { request: (...args: unknown[]) => Promise<unknown> };
        }
      ).ethereum;
      if (!eth) {
        setResult({ error: "MetaMask not detected in window.ethereum" });
        return;
      }
      const account = form.walletAddress;
      if (!account) {
        setResult({ error: "Wallet address not set — connect wallet first" });
        return;
      }
      // normalize/checksum address then fetch nonce from backend
      const checksummed = (() => {
        try {
          return ethers.getAddress(account);
        } catch {
          return account;
        }
      })();
      const nonceRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/nonce/${checksummed}`
      );
      if (!nonceRes.ok) {
        setResult({ error: `Failed to get nonce: ${nonceRes.status}` });
        return;
      }
      const nonceBody = await nonceRes.json();
      const nonce =
        nonceBody?.nonce ??
        nonceBody?.value?.nonce ??
        nonceBody?.data?.nonce ??
        null;
      if (!nonce) {
        setResult({ error: `Failed to get nonce: ${nonceRes.status}` });
        return;
      }
      const issuedAt =
        nonceBody?.issuedAt ??
        nonceBody?.value?.issuedAt ??
        new Date().toISOString();
      const expiresAt =
        nonceBody?.expiresAt ??
        nonceBody?.value?.expiresAt ??
        new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const siweMessage = new SiweMessage({
        domain: window.location.hostname || "secure-docs.example.com",
        address: checksummed,
        statement: "Register wallet for Secure Docs",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt,
        expirationTime: expiresAt,
      });

      const messageToSign = siweMessage.prepareMessage();

      // personal_sign params: [message, account]
      const sigRaw = await eth.request({
        method: "personal_sign",
        params: [messageToSign, account],
      });
      const signature = String(sigRaw);
      setForm((s) => ({ ...s, message: messageToSign, signature }));
      setResult({ status: 200, body: { signature } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setResult({ error: message });
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Test: Register User</h1>
      <p>
        Use this simple form to test the registration API. Fill fields and POST.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Wallet Address
          <input
            name="walletAddress"
            onChange={onChange}
            style={{ width: "100%" }}
            value={form.walletAddress}
          />
        </label>

        <label>
          Username
          <input
            name="username"
            onChange={onChange}
            style={{ width: "100%" }}
            value={form.username}
          />
        </label>

        <label>
          Email
          <input
            name="email"
            onChange={onChange}
            style={{ width: "100%" }}
            value={form.email}
          />
        </label>

        <label>
          Message
          <textarea
            name="message"
            onChange={onChange}
            style={{ width: "100%" }}
            value={form.message}
          />
        </label>

        <label>
          Signature
          <input
            name="signature"
            onChange={onChange}
            style={{ width: "100%" }}
            value={form.signature}
          />
        </label>

        {/* publicKey removed — SIWE message + signature are used */}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button disabled={loading} type="submit">
            {loading ? "Sending…" : "Send"}
          </button>
          <button onClick={connectWallet} type="button">
            Connect Wallet
          </button>
          <button onClick={signMessage} type="button">
            Sign Message
          </button>
          <button
            onClick={() => {
              setForm({
                walletAddress: "",
                username: "",
                email: "",
                message: "",
                signature: "",
              });
              setResult(null);
            }}
            type="button"
          >
            Reset
          </button>
        </div>
      </form>

      <section style={{ marginTop: 18 }}>
        <h3>Response</h3>
        <pre
          style={{ whiteSpace: "pre-wrap", background: "#f4f4f4", padding: 12 }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
        <p style={{ color: "#666", fontSize: 13 }}>
          Notes: If your API runs on a different origin, change the fetch URL
          above to the full API URL and ensure CORS is enabled on the backend.
        </p>
      </section>
    </div>
  );
}
