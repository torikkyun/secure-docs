"use client";

import { CalendarIcon, Check, Loader2, Mail, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { TimePicker } from "@/components/ui/time-picker";
import { useShare } from "@/hooks/useShare";
import { fileApi } from "@/lib/api";
import { searchUsersByEmail } from "@/lib/userApi";
import type { UserSearchResult } from "@/lib/validation";
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
  const [recipientInfo, setRecipientInfo] = useState<UserSearchResult | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [expiryTime, setExpiryTime] = useState("23:59");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [passcode, setPasscode] = useState<string>("");
  const contractAddress = process.env.NEXT_PUBLIC_FILE_SHARE_CONTRACT || "";
  const [shareProgress, setShareProgress] = useState(0);
  const [shareStep, setShareStep] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isSharing, shareFile } = useShare();

  // Debounced search effect
  useEffect(() => {
    if (!recipientEmail || recipientEmail.length < 2) {
      setSuggestions([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const authToken = localStorage.getItem("auth_token") || "";
        const results = await searchUsersByEmail(recipientEmail, authToken);
        console.log("Search results:", results);
        setSuggestions(results);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [recipientEmail]);

  const handleSelectUser = (user: UserSearchResult) => {
    setRecipientInfo(user);
    setRecipientEmail(user.email || "");
    setSuggestions([]);
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

      // Combine date and time into ISO string
      let expiresAt: string | undefined;
      if (expiryDate) {
        const [hours, minutes] = expiryTime.split(":");
        const combinedDate = new Date(expiryDate);
        combinedDate.setHours(
          Number.parseInt(hours, 10),
          Number.parseInt(minutes, 10),
        );
        expiresAt = combinedDate.toISOString();
      }

      await shareFile({
        fileId: file.id,
        fileDetails: {
          encryptedKeyOwner: fileDetails.file.encryptedKeyOwner,
        },
        recipientEmail: recipientInfo.email || "",
        recipientPublicKey: recipientInfo.publicKey,
        passcode,
        expiresAt,
        onProgress: (step) => {
          setShareStep(step);
          // Optimized progress tracking
          const progressMap: Record<string, number> = {
            "Loading identity": 10,
            Decrypting: 30,
            Encrypting: 60,
            "Saving access grant": 80,
            completed: 100,
          };
          const matchedKey = Object.keys(progressMap).find((key) =>
            step.includes(key),
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
    setRecipientEmail("");
    setRecipientInfo(null);
    setSuggestions([]);
    setExpiryDate(undefined);
    setExpiryTime("23:59");
    setDatePickerOpen(false);
    setPasscode("");
    setShareProgress(0);
    setShareStep("");
    setShareSuccess(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
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
          {/* Recipient Email with Autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email Address</Label>
            <div className="relative">
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
                <Input
                  className="px-9"
                  disabled={isSharing || !!recipientInfo}
                  id="recipientEmail"
                  onChange={(e) => {
                    setRecipientEmail(e.target.value);
                    if (recipientInfo) {
                      setRecipientInfo(null);
                    }
                  }}
                  placeholder="Search by email or username..."
                  ref={inputRef}
                  type="text"
                  value={recipientEmail}
                />
                {isSearching && (
                  <Loader2 className="pointer-events-none absolute right-3 size-4 animate-spin text-muted-foreground" />
                )}
                {recipientEmail && !recipientInfo && !isSearching && (
                  <Button
                    className="absolute right-1 size-7"
                    onClick={() => {
                      setRecipientEmail("");
                      setSuggestions([]);
                      inputRef.current?.focus();
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && !recipientInfo && (
                <div className="slide-in-from-top-2 absolute top-full left-0 z-50 mt-2 w-full animate-in overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                  <div className="border-border border-b bg-muted/30 px-3 py-2">
                    <p className="text-muted-foreground text-xs">
                      Found {suggestions.length} user
                      {suggestions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {suggestions.map((user) => (
                      <li key={user.id || user.email}>
                        <button
                          className="group flex w-full items-center gap-3 border-border border-b px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/50"
                          onClick={() => handleSelectUser(user)}
                          type="button"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                            <User className="size-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground text-sm group-hover:text-primary">
                              {user.username}
                            </p>
                            <p className="truncate text-muted-foreground text-xs">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Selected Recipient Info */}
          {recipientInfo && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Check className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      {recipientInfo.username}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {recipientInfo.email}
                    </p>
                    <p className="mt-1 truncate font-mono text-muted-foreground text-xs">
                      {recipientInfo.walletAddress}
                    </p>
                  </div>
                  <Button
                    className="shrink-0"
                    onClick={() => {
                      setRecipientInfo(null);
                      setRecipientEmail("");
                      inputRef.current?.focus();
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

          {/* Security Passcode */}
          <div className="space-y-2">
            <Label htmlFor="passcode">Security Passcode (Required)</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Enter your security passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isSharing}
            />
          </div>

          {/* Expiry Date & Time (Optional) */}
          <div className="space-y-2">
            <Label>Expiry Date & Time (Optional)</Label>
            <div className="flex gap-2">
              {/* Date Picker */}
              <Popover onOpenChange={setDatePickerOpen} open={datePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className="flex-1 justify-start font-normal"
                    disabled={isSharing}
                    variant="outline"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {expiryDate ? (
                      expiryDate.toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    disabled={(date) => date < new Date()}
                    mode="single"
                    onSelect={(date) => {
                      setExpiryDate(date);
                      setDatePickerOpen(false);
                    }}
                    selected={expiryDate}
                  />
                </PopoverContent>
              </Popover>

              {/* Time Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="w-32 justify-start font-normal"
                    disabled={isSharing || !expiryDate}
                    variant="outline"
                  >
                    {expiryTime}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-auto p-4">
                  <TimePicker
                    disabled={isSharing}
                    onChange={setExpiryTime}
                    value={expiryTime}
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Button */}
              {expiryDate && (
                <Button
                  disabled={isSharing}
                  onClick={() => {
                    setExpiryDate(undefined);
                    setExpiryTime("23:59");
                  }}
                  size="icon"
                  variant="outline"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            {expiryDate && (
              <p className="text-muted-foreground text-xs">
                Access will expire on {expiryDate.toLocaleDateString()} at{" "}
                {expiryTime}
              </p>
            )}
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
