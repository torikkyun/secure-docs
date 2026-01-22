"use client";

import {
  AlertCircle,
  CheckCircle,
  Key,
  Loader2,
  Mail,
  User,
  Lock,
  KeyRound,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import {
  Identity,
  generateIdentity,
  saveIdentity,
} from "@/lib/crypto/key-manager";

type Status = "idle" | "generating" | "submitting" | "success" | "error";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    passcode: "",
  });

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  // Validate email regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");

      // 1. Validation
      if (!form.username || !form.email || !form.password || !form.passcode) {
        throw new Error("Please fill in all fields");
      }
      if (!EMAIL_REGEX.test(form.email)) {
        throw new Error("Invalid email address");
      }
      if (form.passcode.length !== 6) {
        throw new Error("Passcode must be exactly 6 digits");
      }

      setStatus("generating");

      // 2. Generate Identity
      const newIdentity = await generateIdentity();
      setIdentity(newIdentity);

      // 3. Show Recovery Dialog
      setShowRecoveryDialog(true);
      setStatus("idle");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleConfirmAndRegister = async () => {
    if (!identity) return;

    try {
      setStatus("submitting");

      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        passcode: form.passcode,
        publicKey: identity.publicKey,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save identity locally
      await saveIdentity(identity);

      setStatus("success");
      setShowRecoveryDialog(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
      // Close dialog if error occurs so user can see error on main form?
      // Or keep it open. Better to keep it open if it's API error, but maybe better UX to close and show error on form.
      // Let's keep dialog open if it's a submission error?
      // Actually, if it's an API error (e.g. email taken), the user might need to change the email.
      // So we should probably close the dialog and let them edit.
      setShowRecoveryDialog(false);
    }
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
            <User className="size-8 text-primary" />
          </div>
          <CardTitle className="font-bold text-3xl">Create Account</CardTitle>
          <CardDescription>Register to start using SecureDocs</CardDescription>
        </CardHeader>

        <CardContent>
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Account Created!</h3>
                <p className="text-muted-foreground">Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInitiateRegister} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    className="pl-10"
                    value={form.username}
                    onChange={handleChange}
                    required
                    disabled={
                      status === "generating" || status === "submitting"
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={
                      status === "generating" || status === "submitting"
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={
                      status === "generating" || status === "submitting"
                    }
                  />
                </div>
              </div>

              {/* Passcode */}
              <div className="space-y-2">
                <Label htmlFor="passcode">Security PIN (6 digits)</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="passcode"
                    name="passcode"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    className="pl-10"
                    value={form.passcode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setForm((prev) => ({ ...prev, passcode: val }));
                    }}
                    required
                    disabled={
                      status === "generating" || status === "submitting"
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for verifying sensitive operations.
                </p>
              </div>

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
                type="submit"
                disabled={status !== "idle" && status !== "error"}
                size="lg"
              >
                {status === "generating" ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Generating Keys...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

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
            </form>
          )}
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
              This 12-word phrase is the ONLY way to recover your data if you
              lose access. Store it safely.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm">Warning</p>
                <p className="mt-1 text-red-700 text-sm">
                  We cannot recover this phrase for you. Without it, your
                  encrypted files will be lost forever if you forget your
                  password.
                </p>
              </div>
            </div>

            {/* Recovery Phrase Display */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <Label className="mb-2 block text-muted-foreground text-sm">
                Recovery Phrase
              </Label>
              <p className="break-words font-mono text-sm leading-relaxed tracking-wide">
                {identity?.mnemonic}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={copyRecoveryPhrase}
              variant="outline"
            >
              <Copy className="mr-2 size-4" />
              Copy to Clipboard
            </Button>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={handleConfirmAndRegister}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 size-4" />
                  I've Saved My Recovery Phrase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
