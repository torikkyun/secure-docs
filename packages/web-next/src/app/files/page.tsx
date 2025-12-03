"use client";

import { FileText, Loader2, Share2, Upload, X, ArrowUp, ArrowDown } from "lucide-react";
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
    "uploaded"
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

      // Get Pinata JWT from environment or localStorage
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
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
    <AppLayout breadcrumbs={["Tệp Của Tôi"]}>
      <div className="min-h-screen bg-white dark:bg-neutral-950 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-8">
          <div className="flex-1">
            <h1 className="font-bold text-3xl text-black dark:text-white mb-2">Tệp Của Tôi</h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Tải lên và quản lý các tệp được mã hóa của bạn một cách an toàn
            </p>
          </div>
          <Button 
            onClick={() => setIsUploadDialogOpen(true)} 
            size="lg" 
            className="ml-6 bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 font-semibold transition-colors duration-200"
          >
            <Upload className="mr-2 size-5" />
            Tải Lên Tệp
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="uploaded"
          onValueChange={(value) =>
            setActiveTab(value as "uploaded" | "received")
          }
          className="w-full"
        >
          <TabsList className="bg-transparent border-b border-gray-300 dark:border-neutral-700 p-0 w-full justify-start rounded-none h-auto gap-0">
            <TabsTrigger 
              value="uploaded" 
              className="relative px-4 py-4 font-semibold text-base rounded-none border-b-2 border-transparent data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black dark:data-[state=active]:bg-white dark:data-[state=active]:border-white dark:data-[state=active]:text-black text-gray-700 dark:text-gray-500 bg-transparent hover:text-gray-900 dark:hover:text-gray-300 transition-all duration-200 flex items-center gap-2"
            >
              <ArrowUp className="size-5" />
              <span>Tệp Tải Lên</span>
            </TabsTrigger>
            <TabsTrigger 
              value="received" 
              className="relative px-4 py-4 font-semibold text-base rounded-none border-b-2 border-transparent data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black dark:data-[state=active]:bg-white dark:data-[state=active]:border-white dark:data-[state=active]:text-black text-gray-700 dark:text-gray-500 bg-transparent hover:text-gray-900 dark:hover:text-gray-300 transition-all duration-200 flex items-center gap-2"
            >
              <ArrowDown className="size-5" />
              <span>Tệp Đã Nhận</span>
            </TabsTrigger>
          </TabsList>

          {/* Uploaded Files Tab */}
          <TabsContent className="mt-8" value="uploaded">
            {!loading && files.length === 0 && (
              <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-24">
                  <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-full mb-6">
                    <FileText className="size-12 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="mb-3 font-bold text-black dark:text-white text-lg">
                    Chưa tải lên tệp nào
                  </p>
                  <p className="mb-8 text-gray-600 dark:text-gray-400 text-base text-center max-w-md">
                    Bắt đầu bằng cách tải lên tệp được mã hóa đầu tiên của bạn
                  </p>
                  <Button 
                    onClick={() => setIsUploadDialogOpen(true)} 
                    className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 font-semibold"
                  >
                    <Upload className="mr-2 size-4" />
                    Tải Lên Tệp
                  </Button>
                </CardContent>
              </Card>
            )}
            {(loading || files.length > 0) && (
              <div className="space-y-6">
                <FileTable
                  files={files}
                  loading={loading}
                  onFileDeletedAction={fetchFiles}
                />

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200 dark:border-neutral-800">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      variant="outline"
                      className="border border-gray-300 dark:border-neutral-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      ← Trước
                    </Button>
                    <span className="text-gray-700 dark:text-gray-300 text-base font-medium min-w-fit">
                      Trang <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
                    </span>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      variant="outline"
                      className="border border-gray-300 dark:border-neutral-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Tiếp →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Received Files Tab */}
          <TabsContent className="mt-8" value="received">
            {!loading && files.length === 0 && (
              <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-24">
                  <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-full mb-6">
                    <Share2 className="size-12 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="mb-3 font-bold text-black dark:text-white text-lg">
                    Chưa nhận tệp nào
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-base text-center max-w-md">
                    Các tệp được chia sẻ với bạn sẽ xuất hiện ở đây
                  </p>
                </CardContent>
              </Card>
            )}
            {(loading || files.length > 0) && (
              <div className="space-y-6">
                <FileTable
                  files={files}
                  loading={loading}
                  onFileDeletedAction={fetchFiles}
                  onShareAction={handleShareFile}
                />

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200 dark:border-neutral-800">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      variant="outline"
                      className="border border-gray-300 dark:border-neutral-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      ← Trước
                    </Button>
                    <span className="text-gray-700 dark:text-gray-300 text-base font-medium min-w-fit">
                      Trang <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span>
                    </span>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      variant="outline"
                      className="border border-gray-300 dark:border-neutral-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Tiếp →
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
        <DialogContent className="sm:max-w-[550px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white text-2xl font-bold">Tải Lên Tệp</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-base mt-2">
              Chọn một tệp để mã hóa và tải lên IPFS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-6">
            {/* Drag & Drop Zone */}
            {!selectedFile && (
              <div className="relative">
                <button
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-gray-300 dark:border-neutral-700 border-dashed bg-white dark:bg-neutral-800 p-12 transition-all duration-200 hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-750 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  type="button"
                >
                  <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-full mb-4">
                    <FileText className="size-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="font-bold text-black dark:text-white text-base mb-1">
                    Thả tệp tại đây hoặc nhấp để duyệt
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Tệp sẽ được mã hóa trước khi tải lên
                  </p>
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
              <Card className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-200 dark:bg-neutral-700 p-2 rounded-lg">
                        <FileText className="size-6 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="font-bold text-black dark:text-white text-sm truncate max-w-xs">
                          {selectedFile.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {formatBytes(selectedFile.size)} • {selectedFile.type || "Loại không xác định"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedFile(null)}
                      size="icon"
                      variant="ghost"
                      className="text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-colors duration-200 rounded-lg"
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
                  <Loader2 className="size-5 animate-spin text-black dark:text-white flex-shrink-0" />
                  <p className="font-semibold text-sm text-black dark:text-white">
                    {(() => {
                      if (uploadProgress < 30) {
                        return "Đang mã hóa tệp...";
                      }
                      if (uploadProgress < 70) {
                        return "Đang tải lên IPFS...";
                      }
                      return "Đang lưu siêu dữ liệu...";
                    })()}
                  </p>
                </div>
                <div className="bg-gray-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-black dark:bg-white h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs text-right">{uploadProgress}%</p>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                <div className="flex gap-3">
                  <div className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">✓</div>
                  <div>
                    <p className="font-bold text-green-900 dark:text-green-200 text-sm">
                      Tệp đã tải lên thành công!
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                      Tệp của bạn đã được mã hóa và lưu trữ trên IPFS
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex gap-3">
                  <div className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">⚠</div>
                  <div>
                    <p className="font-bold text-red-900 dark:text-red-200 text-sm">Lỗi</p>
                    <p className="text-red-700 dark:text-red-300 text-xs mt-1">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-neutral-800 pt-6">
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
              className="border border-gray-300 dark:border-neutral-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold disabled:opacity-50 transition-colors duration-200"
            >
              Hủy
            </Button>
            <Button
              disabled={!selectedFile || isUploading || uploadSuccess}
              onClick={handleUpload}
              className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 font-semibold disabled:opacity-50 transition-colors duration-200"
            >
              {(() => {
                if (isUploading) {
                  return (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang tải lên...
                    </>
                  );
                }
                if (uploadSuccess) {
                  return "✓ Xong";
                }
                return "Tải Lên";
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
