"use client";

import { FileText, Loader2, Share2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FileTable from "@/components/dashboard/FileTable";
import AppLayout from "@/components/layout/AppLayout";
import { ShareFileDialog } from "@/components/ShareFileDialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpload } from "@/hooks/useUpload";
import { fileApi } from "@/lib/api";
import { formatBytes } from "@/lib/formatters";
import type { File as FileType } from "@/types/api";

/* formatBytes moved to `@/lib/formatters` */

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState<"uploaded" | "received">(
    "uploaded",
  );
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Share state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<FileType | null>(null);

  // Files state
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  // const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { isUploading, uploadFile } = useUpload();

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fileApi.findAll({
        type: activeTab,
        page: currentPage,
        limit: 20,
        // search: searchQuery || undefined,
      });

      setFiles(response.files);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

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

      // Get Pinata JWT - Removed as upload is now direct to backend

      // Get auth token from localStorage
      // const backendToken = localStorage.getItem("auth_token") || undefined; // Handled by API client

      setUploadProgress(30);

      // Upload file
      await uploadFile(selectedFile);

      setUploadProgress(100);
      setUploadSuccess(true);

      // Refetch files list
      setTimeout(() => {
        fetchFiles();
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 1500);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    }
  };

  const handleShareFile = (file: FileType) => {
    setFileToShare(file);
    setIsShareDialogOpen(true);
  };

  const handleShareSuccess = () => {
    fetchFiles(); // Refresh files list after successful share
  };

  return (
    <AppLayout
      breadcrumbs={["My Files"]}
      description="Upload and manage your encrypted files"
      title="My Files"
    >
      <div className="space-y-6 p-8">
        {/* Tabs */}
        <Tabs
          defaultValue="uploaded"
          onValueChange={(value) =>
            setActiveTab(value as "uploaded" | "received")
          }
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="uploaded">My Uploads</TabsTrigger>
              <TabsTrigger value="received">Received Files</TabsTrigger>
            </TabsList>

            {/* Upload Button */}
            <div className="flex items-center justify-end">
              <Button onClick={() => setIsUploadDialogOpen(true)} size="lg">
                <Upload className="mr-2 size-5" />
                Upload File
              </Button>
            </div>
          </div>

          {/* Uploaded Files Tab */}
          <TabsContent className="mt-6" value="uploaded">
            {!loading && files.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="mb-4 size-12 text-muted-foreground" />
                  <p className="mb-2 font-medium text-foreground">
                    No files uploaded yet
                  </p>
                  <p className="mb-4 text-muted-foreground text-sm">
                    Start by uploading your first encrypted file
                  </p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="mr-2 size-4" />
                    Upload File
                  </Button>
                </CardContent>
              </Card>
            )}
            {(loading || files.length > 0) && (
              <div className="space-y-4">
                <FileTable
                  files={files}
                  loading={loading}
                  onFileDeletedAction={fetchFiles}
                  onShareAction={handleShareFile}
                  sectionTitle="My Uploads"
                />

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="text-muted-foreground text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Received Files Tab */}
          <TabsContent className="mt-6" value="received">
            {!loading && files.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Share2 className="mb-4 size-12 text-muted-foreground" />
                  <p className="mb-2 font-medium text-foreground">
                    No files received yet
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Files shared with you will appear here
                  </p>
                </CardContent>
              </Card>
            )}
            {(loading || files.length > 0) && (
              <div className="space-y-4">
                <FileTable
                  files={files}
                  isReceivedFiles={true}
                  loading={loading}
                  onFileDeletedAction={fetchFiles}
                  onShareAction={handleShareFile}
                  sectionTitle="Received Files"
                />

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="text-muted-foreground text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog onOpenChange={setIsUploadDialogOpen} open={isUploadDialogOpen}>
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
      </Dialog>

      {/* Share Dialog */}
      <ShareFileDialog
        file={fileToShare}
        isOpen={isShareDialogOpen}
        onCloseAction={() => {
          setIsShareDialogOpen(false);
          setFileToShare(null);
        }}
        onSuccessAction={handleShareSuccess}
      />
    </AppLayout>
  );
}
