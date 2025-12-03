"use client";

import { ethers } from "ethers";
import {
  AlertCircle,
  CheckCircle,
  Key,
  Loader2,
  Mail,
  User,
  Wallet,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Identity, KeyManager } from "@/lib/crypto/key-manager";

type Status =
  | "idle"
  | "connecting"
  | "generating"
  | "preparing"
  | "signing"
  | "submitting"
  | "success"
  | "error";

type FormErrors = {
  username?: string;
  email?: string;
};

// Regex patterns defined at top level for performance
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This function handles registration flow which requires multiple validation steps
export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    walletAddress: "",
    username: "",
    email: "",
    message: "",
    signature: "",
    publicKey: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryPhraseSaved, setRecoveryPhraseSaved] = useState(false);

  // Check for MetaMask on mount
  useEffect(() => {
    const checkMetaMask = () => {
      const eth = (window as unknown as { ethereum?: unknown }).ethereum;
      setHasMetaMask(!!eth);
    };
    checkMetaMask();
  }, []);

  // Validate username
  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return "Username is required";
    }
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (username.length > 30) {
      return "Username must not exceed 30 characters";
    }
  };

  // Validate email
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    const usernameError = validateUsername(form.username);
    if (usernameError) {
      errors.username = usernameError;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      errors.email = emailError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const connectWallet = async () => {
    try {
      setStatus("connecting");
      setError("");

      const eth = (
        window as unknown as {
          ethereum: {
            request: (args: { method: string }) => Promise<string[]>;
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
        setForm((prev) => ({ ...prev, walletAddress: addr }));

        // Generate encryption keys
        await generateKeys(addr);
      }
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const generateKeys = async (_walletAddr: string) => {
    try {
      setStatus("generating");

      // Generate encryption key pair using existing KeyManager
      const newIdentity = await KeyManager.generateIdentity();
      setIdentity(newIdentity);

      // Use the X25519 public key from identity
      setForm((prev) => ({
        ...prev,
        publicKey: newIdentity.publicKey,
      }));

      // Show recovery dialog
      setShowRecoveryDialog(true);
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const prepareMessage = async (walletAddr: string) => {
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

      // Create SIWE message for registration
      const siwe = new SiweMessage({
        domain: window.location.hostname || "secure-docs.example.com",
        address: walletAddr,
        statement: "Register wallet for Secure Docs",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt,
        expirationTime: expiresAt,
      });

      const msg = siwe.prepareMessage();
      setForm((prev) => ({ ...prev, message: msg }));
      setStatus("idle");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Registration flow requires validation and multi-step process
  const signAndSubmit = async () => {
    try {
      // Validate form first
      if (!validateForm()) {
        return;
      }

      // Check if recovery phrase was saved
      if (!recoveryPhraseSaved) {
        setError("Please save your recovery phrase before continuing");
        return;
      }

      // Validate form
      if (
        !(form.walletAddress && form.username && form.email && form.message)
      ) {
        throw new Error("Please fill in all fields");
      }

      setStatus("signing");
      setError("");

      // Sign message
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
        params: [form.message, form.walletAddress],
      });

      setForm((prev) => ({ ...prev, signature: String(sig) }));

      // Submit registration
      setStatus("submitting");

      const payload = {
        walletAddress: form.walletAddress,
        username: form.username,
        email: form.email,
        message: form.message,
        signature: String(sig),
        publicKey: form.publicKey,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save identity to IndexedDB using KeyManager
      if (identity) {
        await KeyManager.saveIdentity(identity);
      }

      setStatus("success");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "connecting":
        return "Connecting to MetaMask...";
      case "generating":
        return "Generating encryption keys...";
      case "preparing":
        return "Preparing registration message...";
      case "signing":
        return "Please sign the message in MetaMask...";
      case "submitting":
        return "Creating your account...";
      case "success":
        return "Registration successful! Redirecting to login...";
      default:
        return "";
    }
  };

  const isFormReady = form.walletAddress && form.publicKey && form.message;
  const isProcessing =
    status === "connecting" ||
    status === "generating" ||
    status === "preparing" ||
    status === "signing" ||
    status === "submitting";

  const handleContinueAfterRecovery = async () => {
    if (!form.walletAddress) {
      return;
    }

    setShowRecoveryDialog(false);
    setRecoveryPhraseSaved(true);

    // Now prepare the message
    await prepareMessage(form.walletAddress);
  };

  const copyRecoveryPhrase = () => {
    if (identity?.mnemonic) {
      navigator.clipboard.writeText(identity.mnemonic);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 via-white to-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Key className="size-8 text-primary" />
          </div>
          <CardTitle className="font-bold text-3xl">Create Account</CardTitle>
          <CardDescription>
            Register your wallet to start using SecureDocs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
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

          {/* Connect Wallet Button */}
          {!form.walletAddress && (
            <Button
              className="w-full"
              disabled={!hasMetaMask || isProcessing}
              onClick={connectWallet}
              size="lg"
            >
              {status === "connecting" ||
              status === "generating" ||
              status === "preparing" ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  {getStatusMessage()}
                </>
              ) : (
                <>
                  <Wallet className="mr-2 size-5" />
                  Connect MetaMask
                </>
              )}
            </Button>
          )}

          {/* Form Fields */}
          {form.walletAddress && (
            <>
              {/* Wallet Address Display */}
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
                  <Wallet className="size-4 text-muted-foreground" />
                  <p className="flex-1 truncate font-mono text-muted-foreground text-sm">
                    {form.walletAddress}
                  </p>
                  <CheckCircle className="size-4 text-green-600" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                  <Input
                    className={`pl-10 ${
                      formErrors.username
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    disabled={isProcessing}
                    id="username"
                    name="username"
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                    type="text"
                    value={form.username}
                  />
                </div>
                {formErrors.username && (
                  <p className="text-red-500 text-sm">{formErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                  <Input
                    className={`pl-10 ${
                      formErrors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    disabled={isProcessing}
                    id="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    type="email"
                    value={form.email}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>

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

              {/* Submit Button */}
              <Button
                className="w-full"
                disabled={
                  !(isFormReady && form.username && form.email) ||
                  isProcessing ||
                  status === "success"
                }
                onClick={signAndSubmit}
                size="lg"
              >
                {(() => {
                  if (status === "signing" || status === "submitting") {
                    return (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        {getStatusMessage()}
                      </>
                    );
                  }
                  if (status === "success") {
                    return (
                      <>
                        <CheckCircle className="mr-2 size-5" />
                        Success!
                      </>
                    );
                  }
                  return "Register Account";
                })()}
              </Button>
            </>
          )}

          {/* Login Link */}
          <div className="text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href="/auth/login"
            >
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Phrase Dialog */}
      <Dialog onOpenChange={setShowRecoveryDialog} open={showRecoveryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="size-5 text-primary" />
              Save Your Recovery Phrase
            </DialogTitle>
            <DialogDescription>
              This 12-word phrase is the ONLY way to recover your encryption
              keys. Store it safely and never share it with anyone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning Box */}
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm">
                  Important Security Warning
                </p>
                <p className="mt-1 text-red-700 text-xs">
                  If you lose this phrase, your encrypted files cannot be
                  recovered. Write it down and store it securely offline.
                </p>
              </div>
            </div>

            {/* Recovery Phrase Display */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <Label className="mb-2 block text-muted-foreground text-sm">
                Recovery Phrase
              </Label>
              <p className="wrap-break-word font-mono text-sm leading-relaxed">
                {identity?.mnemonic}
              </p>
            </div>

            {/* Copy Button */}
            <Button
              className="w-full"
              onClick={copyRecoveryPhrase}
              variant="outline"
            >
              <svg
                aria-label="Copy icon"
                className="mr-2 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Copy to clipboard</title>
                <path
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Copy to Clipboard
            </Button>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={handleContinueAfterRecovery}>
              <CheckCircle className="mr-2 size-4" />
              I've Saved My Recovery Phrase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
