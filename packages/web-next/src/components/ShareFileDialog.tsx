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
      toast.error("Vui lòng nhập một địa chỉ Ethereum hợp lệ");
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
        throw new Error("Không tìm thấy người dùng");
      }

      const data = await response.json();
      setRecipientInfo({
        username: data.data.username,
        publicKey: data.data.publicKey,
      });
      toast.success("Đã tìm thấy người nhận!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tìm thấy người nhận"
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
        throw new Error("Không tìm thấy khóa mã hóa của tệp");
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
      toast.success("Chia sẻ tệp thành công!");

      setTimeout(() => {
        onSuccessAction?.();
        handleClose();
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chia sẻ thất bại");
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
      <DialogContent className="sm:max-w-[550px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white font-bold text-xl">Chia sẻ tệp</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Chia sẻ "{file.fileName}" với người dùng khác một cách an toàn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contract Address */}
          <div className="space-y-2">
            <Label htmlFor="contractAddress" className="text-black dark:text-white">
              Địa chỉ Smart Contract (Tùy chọn)
            </Label>
            <Input
              disabled={isSharing}
              id="contractAddress"
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              value={contractAddress || ""}
              className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Recipient Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="recipientAddress" className="text-black dark:text-white">Địa chỉ Ví Người nhận</Label>
            <div className="flex gap-2">
              <Input
                disabled={isSharing}
                id="recipientAddress"
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                value={recipientAddress}
                className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-black dark:focus:border-white"
              />
              <Button
                disabled={isSharing || isSearching}
                onClick={handleSearchRecipient}
                variant="secondary"
                className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white border border-gray-200 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700"
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
            <Card className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-black dark:text-white text-sm">
                      {recipientInfo.username}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-mono">
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
                    className="hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full"
                  >
                    <X className="size-4 text-gray-600 dark:text-gray-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiry Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="text-black dark:text-white">Ngày hết hạn (Tùy chọn)</Label>
            <Input
              disabled={isSharing}
              id="expiresAt"
              onChange={(e) => setExpiresAt(e.target.value)}
              type="datetime-local"
              value={expiresAt}
              className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-black dark:focus:border-white text-black dark:text-white"
            />
          </div>

          {/* Share Progress */}
          {isSharing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-black dark:text-white" />
                <p className="font-medium text-sm text-black dark:text-white">{shareStep}</p>
              </div>
              <Progress value={shareProgress} className="h-2 bg-gray-100 dark:bg-neutral-800" />
            </div>
          )}

          {/* Success Message */}
          {shareSuccess && (
            <div className="rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <p className="font-bold text-green-900 dark:text-green-200 text-sm">
                ✓ Chia sẻ tệp thành công!
              </p>
              <p className="mt-1 text-green-700 dark:text-green-300 text-xs">
                Người nhận hiện có thể truy cập tệp này
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            disabled={isSharing}
            onClick={handleClose}
            variant="outline"
            className="border-gray-200 dark:border-neutral-700 text-black dark:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            Hủy
          </Button>
          <Button
            disabled={!recipientInfo || isSharing || shareSuccess}
            onClick={handleShare}
            className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 font-semibold"
          >
            {(() => {
              if (isSharing) {
                return (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang chia sẻ...
                  </>
                );
              }
              if (shareSuccess) {
                return "Xong";
              }
              return "Chia sẻ tệp";
            })()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
