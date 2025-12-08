"use client";

import { useEffect, useState } from "react";
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
import { recoverIdentity, saveIdentity } from "@/lib/crypto/key-manager";
import { formatBytes } from "@/lib/formatters";
import type { User } from "@/types/api";

export default function SettingsPage() {
  const [mnemonic, setMnemonic] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [profile, setProfile] = useState<User | null>(null);
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
        message: "Profile updated successfully!",
      });
    } catch (error: unknown) {
      console.error("Error saving profile:", error);
      setSaveStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to save profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWallet = () => {
    if (profile?.walletAddress) {
      navigator.clipboard.writeText(profile.walletAddress);
    }
  };

  // storage-derived values are provided by useStorage hook

  const handleRecoverIdentity = async () => {
    if (!mnemonic.trim()) {
      setRecoveryStatus({
        type: "error",
        message: "Please enter your recovery phrase",
      });
      return;
    }

    setIsRecovering(true);
    setRecoveryStatus({ type: null, message: "" });

    try {
      const identity = await recoverIdentity(mnemonic.trim());
      await saveIdentity(identity);

      setRecoveryStatus({
        type: "success",
        message:
          "Identity recovered successfully! Your keys have been restored.",
      });

      setMnemonic("");
    } catch (error: unknown) {
      console.error("Recovery failed:", error);
      setRecoveryStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to recover identity. Please check your recovery phrase.",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <AppLayout
      breadcrumbs={["Settings"]}
      description="Manage your account settings and preferences"
      showDetailsSidebar={false}
      title="Settings"
    >
      <div className="space-y-6 p-8">
        {/* Tabs */}
        <Tabs className="w-full" defaultValue="account">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent className="space-y-6" value="account">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details and public profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    disabled={isLoadingProfile}
                    id="username"
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter your username"
                    value={formData.username}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    disabled={isLoadingProfile}
                    id="email"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    type="email"
                    value={formData.email}
                  />
                </div>
                {saveStatus.message && (
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      saveStatus.type === "success"
                        ? "border-green-200 bg-green-50 text-green-900"
                        : "border-red-200 bg-red-50 text-red-900"
                    }`}
                  >
                    <span className="material-icons text-base">
                      {saveStatus.type === "success" ? "check_circle" : "error"}
                    </span>
                    <p className="text-sm">{saveStatus.message}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input
                      className="font-mono text-sm"
                      id="wallet"
                      readOnly
                      value={profile?.walletAddress || "Loading..."}
                    />
                    <Button
                      disabled={!profile}
                      onClick={handleCopyWallet}
                      size="icon"
                      variant="outline"
                    >
                      <span className="material-icons text-base">
                        content_copy
                      </span>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Your wallet address cannot be changed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage</CardTitle>
                <CardDescription>
                  Monitor your storage usage and upgrade if needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">Storage Used</span>
                    <span className="font-semibold text-neutral-900">
                      {storageLoading
                        ? "Loading..."
                        : `${formatBytes(storageUsed)} / ${formatBytes(storageLimit)}`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${usagePercentage}%`,
                      }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {storageLoading
                      ? "Loading..."
                      : formatBytes(storageAvailable)}{" "}
                    available
                  </p>
                </div>
                {/* <Button className="w-full gap-2" variant="outline">
                  <span className="material-icons text-base">upgrade</span>
                  Upgrade Storage Plan
                </Button> */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent className="space-y-6" value="security">
            <Card>
              <CardHeader>
                <CardTitle>Recovery Phrase</CardTitle>
                <CardDescription>
                  Restore your encryption keys using your 12-word recovery
                  phrase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <span className="material-icons text-blue-600">info</span>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 text-sm">
                        Important Security Information
                      </p>
                      <p className="mt-1 text-blue-700 text-xs">
                        Your recovery phrase is the only way to restore access
                        to your encrypted files if you lose your device. Never
                        share it with anyone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recovery-phrase">
                    Recovery Phrase (12 words)
                  </Label>
                  <Input
                    id="recovery-phrase"
                    onChange={(e) => setMnemonic(e.target.value)}
                    placeholder="word1 word2 word3 ... word12"
                    value={mnemonic}
                  />
                </div>

                {recoveryStatus.message && (
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      recoveryStatus.type === "success"
                        ? "border-green-200 bg-green-50 text-green-900"
                        : "border-red-200 bg-red-50 text-red-900"
                    }`}
                  >
                    <span className="material-icons text-base">
                      {recoveryStatus.type === "success"
                        ? "check_circle"
                        : "error"}
                    </span>
                    <p className="text-sm">{recoveryStatus.message}</p>
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  disabled={isRecovering}
                  onClick={handleRecoverIdentity}
                >
                  <span className="material-icons text-base">restore</span>
                  {isRecovering ? "Recovering..." : "Restore Identity"}
                </Button>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Status</p>
                    <p className="text-muted-foreground text-sm">Not enabled</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage your active login sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                      <span className="material-icons text-blue-600">
                        computer
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Current Device</p>
                      <p className="text-muted-foreground text-xs">
                        Windows • Chrome • Active now
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <span className="material-icons text-base">
                      check_circle
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card> */}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 border-neutral-200 border-t pt-6">
          <Button
            onClick={() => {
              setFormData({
                username: profile?.username || "",
                email: profile?.email || "",
              });
              setSaveStatus({ type: null, message: "" });
            }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="gap-2"
            disabled={isSaving || isLoadingProfile}
            onClick={handleSaveProfile}
          >
            <span className="material-icons text-base">save</span>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
