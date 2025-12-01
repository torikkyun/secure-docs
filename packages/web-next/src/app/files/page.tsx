"use client";

import { FileText, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import FileCards from "@/components/dashboard/FileCards";
import AppLayout from "@/components/layout/AppLayout";
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
import { Progress } from "@/components/ui/progress";
import { useRecentFiles } from "@/hooks/useDashboard";
import { useUpload } from "@/hooks/useUpload";

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export default function FilesPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { isUploading, uploadFile } = useUpload();
  const { files, loading: filesLoading, refetch } = useRecentFiles();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploadError(null);
      setUploadSuccess(false);
      setUploadProgress(10);

      // Get Pinata JWT from environment or localStorage
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT || "";
      if (!pinataJwt) {
        throw new Error("Pinata JWT not configured");
      }

      // Get auth token from localStorage
      const backendToken = localStorage.getItem("auth_token") || undefined;

      setUploadProgress(30);

      // Upload file
      await uploadFile(selectedFile, {
        pinataJwt,
        backendToken,
      });

      setUploadProgress(100);
      setUploadSuccess(true);

      // Refetch files list
      setTimeout(() => {
        refetch();
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 1500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    }
  };

  return (
    <AppLayout breadcrumbs={["My Files"]}>
      <div className="space-y-8 p-8">
        {/* Upload Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-2xl text-foreground">My Files</h2>
            <p className="text-muted-foreground text-sm">
              Upload and manage your encrypted files
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)} size="lg">
            <Upload className="mr-2 size-5" />
            Upload File
          </Button>
        </div>

        {/* Files Grid */}
        <FileCards files={files} loading={filesLoading} />
      </div>

      {/* Upload Dialog */}
      <Dialog onOpenChange={setIsUploadDialogOpen} open={isUploadDialogOpen}>
        (
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Select a file to encrypt and upload to IPFS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Drag & Drop Zone */}
            {!selectedFile && (
              <div className="relative">
                <button
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border border-dashed bg-muted/50 p-8 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  type="button"
                >
                  <FileText className="mb-4 size-12 text-muted-foreground" />
                  <p className="mb-2 font-medium text-foreground text-sm">
                    Drop your file here or click to browse
                  </p>
                  <p className="mb-4 text-muted-foreground text-xs">
                    File will be encrypted before upload
                  </p>
                  <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    Choose File
                  </span>
                </button>
                <Input
                  accept="*/*"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileSelect}
                  type="file"
                />
              </div>
            )}

            {/* Selected File Preview */}
            {selectedFile && !isUploading && !uploadSuccess && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileText className="size-10 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {selectedFile.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatBytes(selectedFile.size)} •{" "}
                          {selectedFile.type || "Unknown type"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedFile(null)}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <p className="font-medium text-sm">
                    {(() => {
                      if (uploadProgress < 30) {
                        return "Encrypting file...";
                      }
                      if (uploadProgress < 70) {
                        return "Uploading to IPFS...";
                      }
                      return "Saving metadata...";
                    })()}
                  </p>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="font-medium text-green-900 text-sm">
                  ✓ File uploaded successfully!
                </p>
                <p className="mt-1 text-green-700 text-xs">
                  Your file has been encrypted and stored on IPFS
                </p>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-red-900 text-sm">Error</p>
                <p className="mt-1 text-red-700 text-xs">{uploadError}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              disabled={isUploading}
              onClick={() => {
                setIsUploadDialogOpen(false);
                setSelectedFile(null);
                setUploadError(null);
                setUploadSuccess(false);
                setUploadProgress(0);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedFile || isUploading || uploadSuccess}
              onClick={handleUpload}
            >
              {(() => {
                if (isUploading) {
                  return (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Uploading...
                    </>
                  );
                }
                if (uploadSuccess) {
                  return "Done";
                }
                return "Upload";
              })()}
            </Button>
          </div>
        </DialogContent>
        );
      </Dialog>
    </AppLayout>
  );
}
