"use client";

import { useEffect, useState } from "react";
import { User, Lock, Copy, Check } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStorage } from "@/hooks/useStorage";
import { userApi } from "@/lib/api";
import { KeyManager } from "@/lib/crypto/key-manager";
import { formatBytes } from "@/lib/formatters";
import type { User as UserType } from "@/types/api";

export default function SettingsPage() {
  const [mnemonic, setMnemonic] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [profile, setProfile] = useState<UserType | null>(null);
  const {
    storageUsed,
    storageLimit,
    usagePercentage,
    storageAvailable,
    isLoading: storageLoading,
  } = useStorage();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [copiedWallet, setCopiedWallet] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile(data);
        setFormData({
          username: data.username,
          email: data.email,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    try {
      const data = await userApi.updateProfile(formData);
      setProfile(data);
      setSaveStatus({
        type: "success",
        message: "Hồ sơ đã được cập nhật thành công!",
      });
    } catch (error: unknown) {
      console.error("Error saving profile:", error);
      setSaveStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể lưu hồ sơ. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWallet = () => {
    if (profile?.walletAddress) {
      navigator.clipboard.writeText(profile.walletAddress);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const handleRecoverIdentity = async () => {
    if (!mnemonic.trim()) {
      setRecoveryStatus({
        type: "error",
        message: "Vui lòng nhập cụm phục hồi của bạn",
      });
      return;
    }

    setIsRecovering(true);
    setRecoveryStatus({ type: null, message: "" });

    try {
      const identity = await KeyManager.recoverIdentity(mnemonic.trim());
      await KeyManager.saveIdentity(identity);

      setRecoveryStatus({
        type: "success",
        message:
          "Danh tính đã được phục hồi thành công! Các khóa của bạn đã được khôi phục.",
      });

      setMnemonic("");
    } catch (error: unknown) {
      console.error("Recovery failed:", error);
      setRecoveryStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể phục hồi danh tính. Vui lòng kiểm tra cụm phục hồi của bạn.",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <AppLayout breadcrumbs={["Cài đặt"]} showDetailsSidebar={false}>
      <div className="min-h-screen bg-white dark:bg-neutral-950 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 dark:border-neutral-700 pb-6">
          <div className="flex-1">
            <h1 className="font-bold text-4xl text-black dark:text-white mb-2">Cài đặt</h1>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Quản lý cài đặt tài khoản và tùy chỉnh của bạn
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs className="w-full" defaultValue="account">
          <TabsList className="bg-transparent border-b border-gray-300 dark:border-neutral-700 p-0 w-full justify-start rounded-none h-auto gap-0">
            <TabsTrigger 
              value="account" 
              className="relative px-4 py-4 font-semibold text-base rounded-none border-b-2 border-transparent data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black dark:data-[state=active]:bg-white dark:data-[state=active]:border-white dark:data-[state=active]:text-black text-gray-700 dark:text-gray-500 bg-transparent hover:text-gray-900 dark:hover:text-gray-300 transition-all duration-200 flex items-center gap-2"
            >
              <User className="size-5" />
              <span>Tài khoản</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="relative px-4 py-4 font-semibold text-base rounded-none border-b-2 border-transparent data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black dark:data-[state=active]:bg-white dark:data-[state=active]:border-white dark:data-[state=active]:text-black text-gray-700 dark:text-gray-500 bg-transparent hover:text-gray-900 dark:hover:text-gray-300 transition-all duration-200 flex items-center gap-2"
            >
              <Lock className="size-5" />
              <span>Bảo mật</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent className="mt-10" value="account">
            <div className="grid grid-cols-2 gap-10">
              {/* Left Column - Profile Information */}
              <div className="space-y-6">
                <Card className="h-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-5 border-b border-gray-100 dark:border-neutral-800">
                    <CardTitle className="text-black dark:text-white text-base font-bold">Thông tin hồ sơ</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                      Cập nhật chi tiết tài khoản của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="username" className="text-gray-900 dark:text-gray-100 text-xs font-semibold uppercase tracking-wide">
                        Tên người dùng
                      </Label>
                      <Input
                        disabled={isLoadingProfile}
                        id="username"
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="Nhập tên người dùng"
                        value={formData.username}
                        className="border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-black dark:text-white text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-gray-900 dark:text-gray-100 text-xs font-semibold uppercase tracking-wide">
                        Email
                      </Label>
                      <Input
                        disabled={isLoadingProfile}
                        id="email"
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@example.com"
                        type="email"
                        value={formData.email}
                        className="border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-black dark:text-white text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800">
                      <Label htmlFor="wallet" className="text-gray-900 dark:text-gray-100 text-xs font-semibold uppercase tracking-wide">
                        Địa chỉ Ví
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          className="font-mono text-xs border border-gray-300 dark:border-neutral-700 rounded-md bg-gray-50 dark:bg-neutral-800 text-black dark:text-white"
                          id="wallet"
                          readOnly
                          value={profile?.walletAddress || "Đang tải..."}
                        />
                        <Button
                          disabled={!profile}
                          onClick={handleCopyWallet}
                          size="icon"
                          className="border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-200"
                          variant="outline"
                        >
                          {copiedWallet ? (
                            <Check className="size-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                        Không thể thay đổi địa chỉ ví
                      </p>
                    </div>
                    {saveStatus.message && (
                      <div
                        className={`flex items-start gap-3 rounded-md border p-3 ${
                          saveStatus.type === "success"
                            ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200"
                            : "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200"
                        }`}
                      >
                        <span className="text-base flex-shrink-0">
                          {saveStatus.type === "success" ? "✓" : "⚠"}
                        </span>
                        <p className="text-xs">{saveStatus.message}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Storage Information */}
              <div className="space-y-6">
                <Card className="h-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-5 border-b border-gray-100 dark:border-neutral-800">
                    <CardTitle className="text-black dark:text-white text-base font-bold">Lưu trữ</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                      Giám sát việc sử dụng lưu trữ của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Dung lượng đã dùng</span>
                        <span className="font-bold text-black dark:text-white text-sm">
                          {storageLoading
                            ? "Đang tải..."
                            : `${formatBytes(storageUsed)} / ${formatBytes(storageLimit)}`}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-black to-gray-900 dark:from-white dark:to-gray-300 transition-all duration-300"
                          style={{
                            width: `${usagePercentage}%`,
                          }}
                        />
                      </div>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                        {storageLoading
                          ? "Đang tải..."
                          : formatBytes(storageAvailable)}{" "}
                        có sẵn
                      </p>
                    </div>

                    {/* Storage Details */}
                    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-neutral-800">
                      <div className="rounded-md bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 p-4 border border-gray-200 dark:border-neutral-700">
                        <p className="text-gray-500 dark:text-gray-500 text-xs font-medium mb-1">PHẦN TRĂM SỬ DỤNG</p>
                        <p className="font-bold text-black dark:text-white text-2xl">
                          {Math.round(usagePercentage)}%
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 p-4 border border-gray-200 dark:border-neutral-700">
                          <p className="text-gray-500 dark:text-gray-500 text-xs font-medium mb-2">TỔNG DUNG LƯỢNG</p>
                          <p className="font-bold text-black dark:text-white text-base">
                            {storageLoading ? "Đang tải..." : formatBytes(storageLimit)}
                          </p>
                        </div>
                        <div className="rounded-md bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 p-4 border border-gray-200 dark:border-neutral-700">
                          <p className="text-gray-500 dark:text-gray-500 text-xs font-medium mb-2">ĐÃ DÙNG</p>
                          <p className="font-bold text-black dark:text-white text-base">
                            {storageLoading ? "Đang tải..." : formatBytes(storageUsed)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent className="mt-8 space-y-6" value="security">
            <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="border-b border-gray-200 dark:border-neutral-800">
                <CardTitle className="text-black dark:text-white text-xl">Cụm phục hồi</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Khôi phục các khóa mã hóa của bạn bằng cụm phục hồi 12 từ của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex gap-3">
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">ℹ</span>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                        Thông tin bảo mật quan trọng
                      </p>
                      <p className="mt-1 text-blue-700 dark:text-blue-300 text-xs">
                        Cụm phục hồi của bạn là cách duy nhất để khôi phục quyền truy cập vào các tệp được mã hóa nếu bạn mất thiết bị. Không bao giờ chia sẻ nó với bất kỳ ai.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recovery-phrase" className="text-black dark:text-white font-semibold">
                    Cụm phục hồi (12 từ)
                  </Label>
                  <Input
                    id="recovery-phrase"
                    onChange={(e) => setMnemonic(e.target.value)}
                    placeholder="word1 word2 word3 ... word12"
                    value={mnemonic}
                    className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white"
                  />
                </div>

                {recoveryStatus.message && (
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      recoveryStatus.type === "success"
                        ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200"
                        : "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200"
                    }`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {recoveryStatus.type === "success" ? "✓" : "⚠"}
                    </span>
                    <p className="text-sm">{recoveryStatus.message}</p>
                  </div>
                )}

                <Button
                  className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 font-semibold gap-2 transition-colors duration-200"
                  disabled={isRecovering}
                  onClick={handleRecoverIdentity}
                >
                  {isRecovering ? "Đang phục hồi..." : "Phục hồi danh tính"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-t border-gray-300 dark:border-neutral-700 pt-6">
          <Button
            onClick={() => {
              setFormData({
                username: profile?.username || "",
                email: profile?.email || "",
              });
              setSaveStatus({ type: null, message: "" });
            }}
            variant="outline"
            className="border border-gray-300 dark:border-neutral-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold transition-colors duration-200"
          >
            Hủy
          </Button>
          <Button
            className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 font-semibold transition-colors duration-200"
            disabled={isSaving || isLoadingProfile}
            onClick={handleSaveProfile}
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
