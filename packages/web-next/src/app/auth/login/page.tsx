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
          "Không tìm thấy MetaMask. Vui lòng cài đặt tiện ích mở rộng MetaMask."
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

      // Create SIWE message
      const siwe = new SiweMessage({
        domain: window.location.hostname || "secure-docs.example.com",
        address: walletAddr,
        statement: "Dang nhap vao Secure Docs",
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

      const data = (await res.json()).data as {
        token?: string;
        message?: string;
      };

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
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
        return "Đang kết nối MetaMask...";
      case "preparing":
        return "Đang chuẩn bị dữ liệu...";
      case "signing":
        return "Vui lòng ký tên trong ví MetaMask...";
      case "submitting":
        return "Đang đăng nhập...";
      case "success":
        return "Đăng nhập thành công! Đang chuyển hướng...";
      default:
        return "";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 text-black dark:bg-black dark:text-white">
      <Card className="w-full max-w-md border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-black dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
            <Wallet className="size-8" />
          </div>
          <CardTitle className="font-bold text-3xl">Chào mừng trở lại</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Kết nối ví của bạn để truy cập SecureDocs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Wallet Address Display */}
          {wallet && (
            <div className="space-y-2">
              <Label>Ví đã kết nối</Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-zinc-900">
                <p className="truncate font-mono text-sm text-gray-600 dark:text-gray-400">
                  {wallet}
                </p>
              </div>
            </div>
          )}

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

          {/* Connect Button */}
          <Button
            className="w-full border-2 border-black bg-black text-white hover:bg-gray-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
            disabled={!hasMetaMask || (status !== "idle" && status !== "error")}
            onClick={connectWallet}
            size="lg"
          >
            {(() => {
              if (status === "success") {
                return (
                  <>
                    <CheckCircle className="mr-2 size-5" />
                    Thành công!
                  </>
                );
              }
              if (status === "idle" || status === "error") {
                return (
                  <>
                    <Wallet className="mr-2 size-5" />
                    Kết nối MetaMask
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
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              className="font-bold text-black underline hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
              href="/auth/register"
            >
              Đăng ký tại đây
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
