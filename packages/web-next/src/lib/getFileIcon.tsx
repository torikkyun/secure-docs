"use client";

import {
  Archive,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

export default function getFileIcon(
  fileNameOrType?: string | null,
  className = "size-5 text-primary"
) {
  const input = (fileNameOrType || "").toLowerCase();

  const isMime = input.includes("/");
  let isImage = false;
  let isPdf = false;
  let isText = false;
  let isArchive = false;

  if (isMime) {
    const mime = input;
    isImage = mime.startsWith("image/");
    isPdf = mime.includes("pdf");
    isArchive =
      mime.includes("zip") ||
      mime.includes("tar") ||
      mime.includes("compressed");
    isText =
      mime.includes("text") ||
      mime.includes("word") ||
      mime.includes("officedocument");
  } else {
    const ext = input.split(".").pop() ?? "";
    isImage = ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext);
    isPdf = ext === "pdf";
    isText = ["doc", "docx", "txt", "md"].includes(ext);
    isArchive = ["zip", "rar", "7z", "tar", "gz"].includes(ext);
  }

  if (isImage) {
    return <ImageIcon className={className} />;
  }

  if (isPdf) {
    return (
      <FileText className={className.replace("text-primary", "text-red-600")} />
    );
  }

  if (isText) {
    return (
      <FileText
        className={className.replace("text-primary", "text-blue-600")}
      />
    );
  }

  if (isArchive) {
    return <Archive className={className} />;
  }

  return (
    <FileIcon className={className.replace("text-primary", "text-gray-500")} />
  );
}
