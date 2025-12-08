"use client";

import { ethers } from "ethers";
import { AlertCircle, CheckCircle, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { setAuthToken } from "@/lib/auth/token-manager";

type Status =
  | "idle"
  | "connecting"
  | "preparing"
  | "signing"
  | "submitting"
  | "success"
  | "error";

export default function LoginPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [hasMetaMask, setHasMetaMask] = useState(false);

  // Check for MetaMask on mount
  useEffect(() => {
    const checkMetaMask = () => {
      const eth = (window as unknown as { ethereum?: unknown }).ethereum;
      setHasMetaMask(!!eth);
    };
    checkMetaMask();
  }, []);

  const connectWallet = async () => {
    try {
      setStatus("connecting");
      setError("");

      const eth = (
        window as unknown as {
          ethereum: {
            request: (args: {
              method: string;
              params?: string[];
            }) => Promise<string[]>;
          };
        }
      ).ethereum;
      if (!eth) {
        throw new Error(
          "MetaMask not detected. Please install MetaMask extension."
        );
      }

      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const addr = ethers.getAddress(accounts[0]);
        setWallet(addr);
        await fetchNonceAndSign(addr);
      }
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const fetchNonceAndSign = async (walletAddr: string) => {
    try {
      setStatus("preparing");

      // Fetch nonce from server
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/nonce/${walletAddr}`
      );

      if (!res.ok) {
        throw new Error(`Failed to get nonce: ${res.status}`);
      }

      const body = (await res.json()).data as {
        nonce?: string;
        issuedAt?: string;
        expiresAt?: string;
      };
      const nonce = body?.nonce;
      const issuedAt = body?.issuedAt || new Date().toISOString();
      const expiresAt =
        body?.expiresAt || new Date(Date.now() + 300_000).toISOString();

      if (!nonce) {
        throw new Error("Nonce not returned from server");
      }

      // Create SIWE message
      const siwe = new SiweMessage({
        domain: window.location.hostname || "secure-docs.example.com",
        address: walletAddr,
        statement: "Login to Secure Docs",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt,
        expirationTime: expiresAt,
      });

      const msg = siwe.prepareMessage();

      // Sign message
      setStatus("signing");
      const eth = (
        window as unknown as {
          ethereum: {
            request: (args: {
              method: string;
              params?: [string, string];
            }) => Promise<string>;
          };
        }
      ).ethereum;
      const sig = await eth.request({
        method: "personal_sign",
        params: [msg, walletAddr],
      });

      // Submit login
      await submitLogin(walletAddr, msg, String(sig));
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const submitLogin = async (walletAddr: string, msg: string, sig: string) => {
    try {
      setStatus("submitting");

      const payload = {
        walletAddress: walletAddr,
        message: msg,
        signature: sig,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await res.json();
      const data = responseData.data as {
        token?: string;
        message?: string;
      };

      if (!res.ok) {
        // Check if user is banned (status 401 with specific message)
        if (res.status === 401 && responseData.message) {
          throw new Error(responseData.message);
        }
        throw new Error(data.message || "Login failed");
      }

      // Save token to localStorage using token manager
      if (data.token) {
        setAuthToken(data.token);
      }

      setStatus("success");

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "connecting":
        return "Connecting to MetaMask...";
      case "preparing":
        return "Preparing message...";
      case "signing":
        return "Please sign the message in MetaMask...";
      case "submitting":
        return "Logging in...";
      case "success":
        return "Login successful! Redirecting...";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 via-white to-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="size-8 text-primary" />
          </div>
          <CardTitle className="font-bold text-3xl">Welcome Back</CardTitle>
          <CardDescription>
            Connect your wallet to login to SecureDocs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Wallet Address Display */}
          {wallet && (
            <div className="space-y-2">
              <Label>Connected Wallet</Label>
              <div className="rounded-lg border border-border bg-muted p-3">
                <p className="truncate font-mono text-muted-foreground text-sm">
                  {wallet}
                </p>
              </div>
            </div>
          )}

          {/* Status Message */}
          {status !== "idle" && status !== "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              {status === "success" ? (
                <CheckCircle className="size-5 text-green-600" />
              ) : (
                <Loader2 className="size-5 animate-spin text-primary" />
              )}
              <p className="font-medium text-blue-900 text-sm">
                {getStatusMessage()}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm">Error</p>
                <p className="mt-1 text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* MetaMask Not Detected Warning */}
          {!hasMetaMask && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 text-sm">
                  MetaMask Required
                </p>
                <p className="mt-1 text-amber-700 text-sm">
                  Please install MetaMask extension to continue.
                </p>
              </div>
            </div>
          )}

          {/* Connect Button */}
          <Button
            className="w-full"
            disabled={!hasMetaMask || (status !== "idle" && status !== "error")}
            onClick={connectWallet}
            size="lg"
          >
            {(() => {
              if (status === "success") {
                return (
                  <>
                    <CheckCircle className="mr-2 size-5" />
                    Success!
                  </>
                );
              }
              if (status === "idle" || status === "error") {
                return (
                  <>
                    <Wallet className="mr-2 size-5" />
                    Connect MetaMask
                  </>
                );
              }
              return (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  {getStatusMessage()}
                </>
              );
            })()}
          </Button>

          {/* Register Link */}
          <div className="text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href="/auth/register"
            >
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
