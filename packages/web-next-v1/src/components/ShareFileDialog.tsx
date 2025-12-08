"use client";

import { Loader2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useShare } from "@/hooks/useShare";
import { fileApi } from "@/lib/api";
import { searchUserByEmail } from "@/lib/userApi";
import { isValidEmail } from "@/lib/validation";
import type { File as FileType } from "@/types/api";

type ShareFileDialogProps = {
  file: FileType | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction?: () => void;
};

export function ShareFileDialog({
  file,
  isOpen,
  onCloseAction,
  onSuccessAction,
}: ShareFileDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientInfo, setRecipientInfo] = useState<{
    username: string;
    publicKey: string;
    walletAddress: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const contractAddress = process.env.NEXT_PUBLIC_FILE_SHARE_CONTRACT || "";
  const [shareProgress, setShareProgress] = useState(0);
  const [shareStep, setShareStep] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);

  const { isSharing, shareFile } = useShare();

  const handleSearchRecipient = async () => {
    if (!isValidEmail(recipientEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSearching(true);
    setRecipientInfo(null);

    try {
      const authToken = localStorage.getItem("auth_token") || "";
      const userData = await searchUserByEmail(recipientEmail, authToken);

      setRecipientInfo(userData);
      toast.success(`Found: ${userData.username || recipientEmail}`);
    } catch (error) {
      console.error("Search recipient error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to find recipient";
      toast.error(errorMessage);
      setRecipientInfo(null);
    } finally {
      setIsSearching(false);
    }
  };
  const handleShare = async () => {
    if (!file) {
      return;
    }
    if (!recipientInfo) {
      return;
    }

    try {
      setShareProgress(0);
      setShareStep("");
      setShareSuccess(false);

      // Fetch full file details to get encryptedKeyOwner
      const fileDetails = await fileApi.findOne(file.id);

      if (!fileDetails.file.encryptedKeyOwner) {
        throw new Error("File encryption key not found");
      }

      await shareFile({
        fileId: file.id,
        fileDetails: {
          encryptedKeyOwner: fileDetails.file.encryptedKeyOwner,
          cid: fileDetails.file.cid,
        },
        recipientWalletAddress: recipientInfo.walletAddress,
        recipientPublicKey: recipientInfo.publicKey,
        contractAddress,
        expiresAt: expiresAt || undefined,
        onProgress: (step) => {
          setShareStep(step);
          // Optimized progress tracking (signature first, then fast operations)
          const progressMap: Record<string, number> = {
            "Loading identity": 10,
            "Preparing signature": 20,
            "Waiting for signature": 30,
            Decrypting: 50,
            Encrypting: 65,
            "Submitting to blockchain": 75,
            "Saving access grant": 90,
            completed: 100,
          };
          const matchedKey = Object.keys(progressMap).find((key) =>
            step.includes(key)
          );
          if (matchedKey) {
            setShareProgress(progressMap[matchedKey]);
          }
        },
      });

      setShareSuccess(true);
      toast.success("File shared successfully!");

      // Show info about blockchain confirmation
      setTimeout(() => {
        toast.info("Blockchain confirmation is processing in the background", {
          duration: 5000,
        });
      }, 1000);

      setTimeout(() => {
        onSuccessAction?.();
        handleClose();
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Share failed");
      setShareProgress(0);
      setShareStep("");
    }
  };

  const handleClose = () => {
    setRecipientEmail("");
    setRecipientInfo(null);
    setExpiresAt("");
    setShareProgress(0);
    setShareStep("");
    setShareSuccess(false);
    onCloseAction();
  };

  if (!file) {
    return null;
  }

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share "{file.fileName}" with another user securely. You'll be asked
            to sign a message to authorize this action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email Address</Label>
            <div className="flex gap-2">
              <Input
                disabled={isSharing}
                id="recipientEmail"
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="user@example.com"
                type="email"
                value={recipientEmail}
              />
              <Button
                disabled={isSharing || isSearching}
                onClick={handleSearchRecipient}
                variant="secondary"
              >
                {isSearching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Recipient Info */}
          {recipientInfo && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {recipientInfo.username}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {recipientEmail}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {recipientInfo.walletAddress}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setRecipientInfo(null);
                      setRecipientEmail("");
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiry Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
            <Input
              disabled={isSharing}
              id="expiresAt"
              onChange={(e) => setExpiresAt(e.target.value)}
              type="datetime-local"
              value={expiresAt}
            />
          </div>

          {/* Share Progress */}
          {isSharing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-primary" />
                <p className="font-medium text-sm">{shareStep}</p>
              </div>
              <Progress value={shareProgress} />
            </div>
          )}

          {/* Success Message */}
          {shareSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-900 text-sm">
                ✓ File shared successfully!
              </p>
              <p className="mt-1 text-green-700 text-xs">
                The recipient can now access this file
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button disabled={isSharing} onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={!recipientInfo || isSharing || shareSuccess}
            onClick={handleShare}
          >
            {(() => {
              if (isSharing) {
                return (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sharing...
                  </>
                );
              }
              if (shareSuccess) {
                return "Done";
              }
              return "Share File";
            })()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
