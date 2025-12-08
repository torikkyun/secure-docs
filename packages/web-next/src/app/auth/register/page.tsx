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
      return "Tên đăng nhập là bắt buộc";
    }
    if (username.length < 3) {
      return "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    if (username.length > 30) {
      return "Tên đăng nhập không được quá 30 ký tự";
    }
  };

  // Validate email
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email là bắt buộc";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Vui lòng nhập địa chỉ email hợp lệ";
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
          "Không tìm thấy MetaMask. Vui lòng cài đặt tiện ích mở rộng MetaMask."
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
        throw new Error(`Không thể lấy nonce: ${res.status}`);
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
        throw new Error("Không nhận được nonce từ máy chủ");
      }

      // Create SIWE message for registration
      const siwe = new SiweMessage({
        domain: window.location.hostname || "secure-docs.example.com",
        address: walletAddr,
        statement: "Dang ky vi cho Secure Docs",
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
        setError("Vui lòng lưu cụm từ khôi phục trước khi tiếp tục");
        return;
      }

      // Validate form
      if (
        !(form.walletAddress && form.username && form.email && form.message)
      ) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
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
        throw new Error(data.message || "Đăng ký thất bại");
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
        return "Đang kết nối MetaMask...";
      case "generating":
        return "Đang tạo khóa mã hóa...";
      case "preparing":
        return "Đang chuẩn bị tin nhắn đăng ký...";
      case "signing":
        return "Vui lòng ký tin nhắn trong MetaMask...";
      case "submitting":
        return "Đang tạo tài khoản...";
      case "success":
        return "Đăng ký thành công! Đang chuyển hướng đến đăng nhập...";
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
    <div className="flex min-h-screen items-center justify-center bg-white p-4 text-black dark:bg-black dark:text-white">
      <Card className="w-full max-w-md border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-black dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
            <Key className="size-8" />
          </div>
          <CardTitle className="font-bold text-3xl">Tạo tài khoản</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Đăng ký ví của bạn để bắt đầu sử dụng SecureDocs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* MetaMask Not Detected Warning */}
          {!hasMetaMask && (
            <div className="flex items-start gap-3 rounded-lg border-2 border-black bg-gray-100 p-4 dark:border-white dark:bg-zinc-900">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm">
                  Yêu cầu MetaMask
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Vui lòng cài đặt tiện ích mở rộng MetaMask để tiếp tục.
                </p>
              </div>
            </div>
          )}

          {/* Connect Wallet Button */}
          {!form.walletAddress && (
            <Button
              className="w-full border-2 border-black bg-black text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
                  Kết nối MetaMask
                </>
              )}
            </Button>
          )}

          {/* Form Fields */}
          {form.walletAddress && (
            <>
              {/* Wallet Address Display */}
              <div className="space-y-2">
                <Label>Địa chỉ ví</Label>
                <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-zinc-900">
                  <Wallet className="size-4 text-gray-600 dark:text-gray-400" />
                  <p className="flex-1 truncate font-mono text-sm text-gray-600 dark:text-gray-400">
                    {form.walletAddress}
                  </p>
                  <CheckCircle className="size-4 text-green-600 dark:text-green-500" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-500" />
                  <Input
                    className={`pl-10 border-gray-300 dark:border-gray-700 focus-visible:ring-black dark:focus-visible:ring-white ${formErrors.username
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                      }`}
                    disabled={isProcessing}
                    id="username"
                    name="username"
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập của bạn"
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
                  <Mail className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-500" />
                  <Input
                    className={`pl-10 border-gray-300 dark:border-gray-700 focus-visible:ring-black dark:focus-visible:ring-white ${formErrors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                      }`}
                    disabled={isProcessing}
                    id="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="Nhập email của bạn"
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
                <div className="flex items-center gap-3 rounded-lg border-2 border-black bg-gray-100 p-4 dark:border-white dark:bg-zinc-900">
                  {status === "success" ? (
                    <CheckCircle className="size-5 text-black dark:text-white" />
                  ) : (
                    <Loader2 className="size-5 animate-spin text-black dark:text-white" />
                  )}
                  <p className="font-medium text-black text-sm dark:text-white">
                    {getStatusMessage()}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border-2 border-red-500 bg-red-50 p-4 dark:bg-red-950/30">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <p className="font-bold text-red-900 text-sm dark:text-red-300">Lỗi</p>
                    <p className="mt-1 text-red-700 text-sm dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                className="w-full border-2 border-black bg-black text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
                        Thành công!
                      </>
                    );
                  }
                  return "Đăng ký tài khoản";
                })()}
              </Button>
            </>
          )}

          {/* Login Link */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Đã có tài khoản?{" "}
            <Link
              className="font-bold text-black underline hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
              href="/auth/login"
            >
              Đăng nhập tại đây
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Phrase Dialog */}
      <Dialog onOpenChange={setShowRecoveryDialog} open={showRecoveryDialog}>
        <DialogContent className="sm:max-w-md border-2 border-black bg-white dark:border-white dark:bg-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
              <Key className="size-5" />
              Lưu Cụm Từ Khôi Phục Của Bạn
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Cụm từ 12 từ này là cách DUY NHẤT để khôi phục khóa mã hóa của bạn. Hãy lưu trữ an toàn và không bao giờ chia sẻ với bất kỳ ai.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warning Box */}
            <div className="flex items-start gap-3 rounded-lg border-2 border-red-500 bg-red-50 p-4 dark:bg-red-950/30">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="font-bold text-red-900 text-sm dark:text-red-300">
                  Cảnh Báo Bảo Mật Quan Trọng
                </p>
                <p className="mt-1 text-red-700 text-xs dark:text-red-400">
                  Nếu bạn mất cụm từ này, các tệp được mã hóa của bạn không thể khôi phục. Hãy viết nó ra và lưu trữ an toàn ngoại tuyến.
                </p>
              </div>
            </div>

            {/* Recovery Phrase Display */}
            <div className="rounded-lg border-2 border-black/20 bg-gray-50 p-4 dark:border-white/20 dark:bg-zinc-900">
              <Label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">
                Cụm từ khôi phục
              </Label>
              <p className="wrap-break-word font-mono text-sm leading-relaxed text-black dark:text-white">
                {identity?.mnemonic}
              </p>
            </div>

            {/* Copy Button */}
            <Button
              className="w-full border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-zinc-800"
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
                <title>Sao chép</title>
                <path
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Sao chép vào khay nhớ tạm
            </Button>
          </div>

          <DialogFooter>
            <Button
              className="w-full border-2 border-black bg-black text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              onClick={handleContinueAfterRecovery}
            >
              <CheckCircle className="mr-2 size-4" />
              Tôi đã lưu cụm từ khôi phục của mình
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
