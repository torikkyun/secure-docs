export function formatBytes(bytes: number | string): string {
  // Convert string to number if needed (for BigInt serialized values)
  const numBytes = typeof bytes === "string" ? Number(bytes) : bytes;

  // Handle invalid or zero values
  if (!numBytes || numBytes === 0 || Number.isNaN(numBytes)) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));

  return `${Number.parseFloat((numBytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default { formatBytes, formatDate };
