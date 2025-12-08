/**
 * Token Info Component - Hiển thị thông tin token (for debugging/testing)
 */

"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTokenPayload,
  getTokenTimeRemaining,
  isAuthenticated,
} from "@/lib/auth/token-manager";

export function TokenInfo() {
  const [authenticated, setAuthenticated] = useState(false);
  const [payload, setPayload] =
    useState<ReturnType<typeof getTokenPayload>>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTokenInfo = () => {
      setAuthenticated(isAuthenticated());
      setPayload(getTokenPayload());
      setTimeRemaining(getTokenTimeRemaining());
    };

    // Initial update
    updateTokenInfo();

    // Update every second
    const intervalId = setInterval(updateTokenInfo, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) {
      return "Expired";
    }

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (!(authenticated && payload)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Token Info</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive">Not Authenticated</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Token Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Status:</span>
          <Badge variant={timeRemaining > 0 ? "default" : "destructive"}>
            {timeRemaining > 0 ? "Active" : "Expired"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Time Remaining:</span>
          <span className="font-medium text-sm">
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm">User ID:</span>
          <code className="rounded bg-muted px-2 py-1 text-xs">
            {payload.userId}
          </code>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm">Wallet:</span>
          <code className="rounded bg-muted px-2 py-1 text-xs">
            {payload.walletAddress}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Issued:</span>
          <span className="text-xs">
            {new Date(payload.iat * 1000).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Expires:</span>
          <span className="text-xs">
            {new Date(payload.exp * 1000).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
