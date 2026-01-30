import type { Request } from "express";

export function extractIpAndUserAgent(req: Request): {
  ipAddress: string;
  userAgent: string;
} {
  if (!req) {
    return { ipAddress: "", userAgent: "" };
  }

  const xForwardedFor =
    (req.headers["x-forwarded-for"] as string) ||
    (req.headers["X-Forwarded-For"] as unknown as string);
  let ipAddress: string;
  if (xForwardedFor) {
    ipAddress = xForwardedFor.split(",")[0].trim();
  } else {
    ipAddress =
      (req.headers["x-real-ip"] as string) ||
      req.ip ||
      req.socket?.remoteAddress ||
      "";
  }

  const userAgent = req.headers["user-agent"] as string;
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
