"use client";
import { ethers } from "ethers";
import { useState } from "react";
import { SiweMessage } from "siwe";

export default function LoginPage() {
  const [wallet, setWallet] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const connectWallet = async () => {
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        setResult({ error: "MetaMask not detected in window.ethereum" });
        return;
      }
      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        const addr = ethers.getAddress(accounts[0]);
        setWallet(addr);
      }
    } catch (err: unknown) {
      setResult({ error: (err as Error).message ?? String(err) });
    }
  };

  const fetchNonceAndPrepare = async () => {
    if (!wallet) return setResult({ error: "Connect wallet first" });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/nonce/${wallet}`
      );
      if (!res.ok) {
        return setResult({ error: `Failed to get nonce: ${res.status}` });
      }
      const body = await res.json();
      const nonce =
        body?.nonce ?? body?.value?.nonce ?? body?.data?.nonce ?? null;
      const issuedAt =
        body?.issuedAt ?? body?.value?.issuedAt ?? new Date().toISOString();
      const expiresAt =
        body?.expiresAt ??
        body?.value?.expiresAt ??
        new Date(Date.now() + 300_000).toISOString();
      if (!nonce) return setResult({ error: "Nonce not returned from server" });

      const siwe = new SiweMessage({
        domain: window.location.hostname || "secure-docs.example.com",
        address: wallet,
        statement: "Login to Secure Docs",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt,
        expirationTime: expiresAt,
      });
      const msg = siwe.prepareMessage();
      setMessage(msg);
      setResult({ status: 200, message: "SIWE prepared" });
    } catch (err: unknown) {
      setResult({ error: (err as Error).message ?? String(err) });
    }
  };

  const signMessage = async () => {
    try {
      const eth = (window as any).ethereum;
      if (!eth) return setResult({ error: "MetaMask not detected" });
      if (!message)
        return setResult({
          error: "No message to sign. Prepare a SIWE message first.",
        });
      const sig = await eth.request({
        method: "personal_sign",
        params: [message, wallet],
      });
      setSignature(String(sig));
      setResult({ status: 200, message: "Message signed" });
    } catch (err: unknown) {
      setResult({ error: (err as Error).message ?? String(err) });
    }
  };

  const submitLogin = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = { walletAddress: wallet, message, signature };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}) as any);
      setResult({ status: res.status, body: data });
      if (res.ok && data?.token) {
        try {
          localStorage.setItem("sd_token", data.token);
        } catch {}
      }
    } catch (err: unknown) {
      setResult({ error: (err as Error).message ?? String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Test: Login with Wallet</h1>
      <p>Use this page to test the SIWE wallet login API.</p>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          Wallet Address
          <input
            onChange={(e) => setWallet(e.target.value)}
            style={{ width: "100%" }}
            value={wallet}
          />
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={connectWallet} type="button">
            Connect Wallet
          </button>
          <button onClick={fetchNonceAndPrepare} type="button">
            Prepare SIWE Message
          </button>
          <button onClick={signMessage} type="button">
            Sign Message
          </button>
          <button
            disabled={loading || !signature}
            onClick={submitLogin}
            type="button"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
          <button
            onClick={() => {
              setMessage("");
              setSignature("");
              setResult(null);
            }}
            type="button"
          >
            Reset
          </button>
        </div>

        <label>
          Message
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: "100%" }}
            value={message}
          />
        </label>

        <label>
          Signature
          <input
            onChange={(e) => setSignature(e.target.value)}
            style={{ width: "100%" }}
            value={signature}
          />
        </label>

        <section style={{ marginTop: 18 }}>
          <h3>Response</h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f4f4f4",
              padding: 12,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
          <p style={{ color: "#666", fontSize: 13 }}>
            If login returns `token`, it will be saved to `localStorage` key
            `sd_token`.
          </p>
        </section>
      </div>
    </div>
  );
}
