import type { Request } from "express";

export function extractIpAndUserAgent(req: Request): {
  ipAddress: string;
  userAgent: string;
} {
  if (!req) {
    return { ipAddress: "", userAgent: "" };
  }

  // Prefer x-forwarded-for forwarded by the frontend (TanStack Start),
  // fall back to req.ip if the header is missing (e.g. frontend could not
  // determine client IP and did not forward the header).
  const xForwardedFor = req.headers["x-forwarded-for"] as string;
  const ipAddress = xForwardedFor
    ? xForwardedFor.split(",")[0].trim()
    : (req.ip ?? "");

  const userAgent = (req.headers["user-agent"] as string) || "";

  return { ipAddress, userAgent };
}

export function getIpAddress(req: Request): string {
  const { ipAddress } = extractIpAndUserAgent(req);
  return ipAddress;
}

export function getUserAgent(req: Request): string {
  const { userAgent } = extractIpAndUserAgent(req);
  return userAgent;
}

export default extractIpAndUserAgent;
