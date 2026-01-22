"use client";

import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Lock,
  Mail,
  KeyRound,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAuthToken } from "@/lib/auth/token-manager";

type Status = "idle" | "submitting" | "success" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passcode: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatus("submitting");
      setError("");

      if (!formData.email || !formData.password || !formData.passcode) {
        throw new Error("Please fill in all fields");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const responseData = await res.json();

      if (!res.ok) {
        if (res.status === 401 && responseData.message) {
          throw new Error(responseData.message);
        }
        throw new Error(responseData.message || "Login failed");
      }

      // Handle token extraction flexibility
      let token = responseData.token || responseData.accessToken;
      if (!token && responseData.data) {
        token = responseData.data.token || responseData.data.accessToken;
      }

      if (token) {
        setAuthToken(token);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-zinc-50 via-white to-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="size-8 text-primary" />
          </div>
          <CardTitle className="font-bold text-3xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to login to SecureDocs
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={status === "submitting" || status === "success"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={status === "submitting" || status === "success"}
                />
              </div>
            </div>

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
                  value={formData.passcode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setFormData((prev) => ({ ...prev, passcode: val }));
                  }}
                  required
                  disabled={status === "submitting" || status === "success"}
                />
              </div>
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
              {status === "submitting" ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Logging in...
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle className="mr-2 size-5" />
                  Success!
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-4 text-center text-muted-foreground text-sm">
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
