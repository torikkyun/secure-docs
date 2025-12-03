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
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientInfo, setRecipientInfo] = useState<{
    username: string;
    publicKey: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [contractAddress, setContractAddress] = useState(
    process.env.NEXT_PUBLIC_FILE_SHARE_CONTRACT
  );
  const [shareProgress, setShareProgress] = useState(0);
  const [shareStep, setShareStep] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);

  const { isSharing, shareFile } = useShare();

  const handleSearchRecipient = async () => {
    if (!recipientAddress || recipientAddress.length !== 42) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:2412"}/api/users/wallet/${recipientAddress}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("User not found");
      }

      const data = await response.json();
      setRecipientInfo({
        username: data.data.username,
        publicKey: data.data.publicKey,
      });
      toast.success("Recipient found!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to find recipient"
      );
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
        recipientWalletAddress: recipientAddress,
        recipientPublicKey: recipientInfo.publicKey,
        contractAddress: contractAddress ?? "",
        expiresAt: expiresAt || undefined,
        onProgress: (step) => {
          setShareStep(step);
          // Simplified progress tracking
          const progressMap: Record<string, number> = {
            "Loading identity": 15,
            Decrypting: 30,
            Encrypting: 45,
            blockchain: 60,
            confirmation: 80,
            "access grant": 95,
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
    setRecipientAddress("");
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
            Share "{file.fileName}" with another user securely
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contract Address */}
          <div className="space-y-2">
            <Label htmlFor="contractAddress">
              Smart Contract Address (Optional)
            </Label>
            <Input
              disabled={isSharing}
              id="contractAddress"
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              value={contractAddress}
            />
          </div>

          {/* Recipient Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Recipient Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                disabled={isSharing}
                id="recipientAddress"
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                value={recipientAddress}
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
                      {recipientAddress}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setRecipientInfo(null);
                      setRecipientAddress("");
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
