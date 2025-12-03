"use client";

import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface Grant {
  id: string;
  file: {
    id: string;
    fileName: string;
    fileSize: string;
  };
  grantee: {
    walletAddress: string;
    username: string;
  };
  status: {
    name: string;
  };
  grantedAt: string;
  expiresAt?: string;
}

export default function RevokeTestPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [token, setToken] = useState<string>("");
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  // Login SIWE State
  const [siweMessage, setSiweMessage] = useState("");
  const [signature, setSignature] = useState("");

  // Revoke SIWE State
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [revokeSiweMessage, setRevokeSiweMessage] = useState("");
  const [revokeSignature, setRevokeSignature] = useState("");

  // Fetch grants when token is available
  useEffect(() => {
    if (token) {
      fetchGrants();
    }
  }, [token]);

  // --- Login SIWE Functions ---

  const prepareSiweMessage = async () => {
    if (!address) {
      setStatus({ success: false, message: "Connect wallet first" });
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3001/api/auth/nonce/${address}`
      );
      const body = await res.json();
      const nonce = body.nonce || body.data?.nonce;

      if (!nonce) throw new Error("Could not fetch nonce");

      const siwe = new SiweMessage({
        domain: window.location.hostname,
        address,
        statement: "Login to Secure Docs",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 300_000).toISOString(), // 5 mins
      });

      const msg = siwe.prepareMessage();
      setSiweMessage(msg);
      setStatus({ success: true, message: "SIWE Message Prepared" });
    } catch (err: any) {
      setStatus({ success: false, message: `Prepare failed: ${err.message}` });
    }
  };

  const signSiweMessage = async () => {
    if (!siweMessage) {
      setStatus({ success: false, message: "Prepare message first" });
      return;
    }
    try {
      const sig = await signMessageAsync({ message: siweMessage });
      setSignature(sig);
      setStatus({ success: true, message: "Message Signed" });
    } catch (err: any) {
      setStatus({ success: false, message: `Sign failed: ${err.message}` });
    }
  };

  const loginWithSiwe = async () => {
    if (!(address && siweMessage && signature)) {
      setStatus({ success: false, message: "Missing login requirements" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          message: siweMessage,
          signature,
        }),
      });

      const data = await res.json();
      if (data.data?.token) {
        setToken(data.data.token);
        setStatus({ success: true, message: "Logged in successfully!" });
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err: any) {
      setStatus({ success: false, message: `Login failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchGrants = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3001/api/access-grants?status=active",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setGrants(data.data.grants);
      } else {
        console.error("Fetch grants failed:", data);
      }
    } catch (err: any) {
      console.error("Failed to fetch grants", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Revoke SIWE Functions ---

  const prepareRevokeMessage = async () => {
    if (!(address && selectedGrant)) {
      setStatus({ success: false, message: "Connect wallet and select grant" });
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3001/api/auth/nonce/${address}`
      );
      const body = await res.json();
      const nonce = body.nonce || body.data?.nonce;

      if (!nonce) throw new Error("Could not fetch nonce");

      const statement = `Revoke access to file ${selectedGrant.file.id} for recipient ${selectedGrant.grantee.walletAddress}`;

      const siwe = new SiweMessage({
        domain: window.location.hostname,
        address,
        statement,
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 300_000).toISOString(), // 5 mins
      });

      const msg = siwe.prepareMessage();
      setRevokeSiweMessage(msg);
      setStatus({ success: true, message: "Revoke Message Prepared" });
    } catch (err: any) {
      setStatus({
        success: false,
        message: `Prepare revoke failed: ${err.message}`,
      });
    }
  };

  const signRevokeMessage = async () => {
    if (!revokeSiweMessage) {
      setStatus({ success: false, message: "Prepare revoke message first" });
      return;
    }
    try {
      const sig = await signMessageAsync({ message: revokeSiweMessage });
      setRevokeSignature(sig);
      setStatus({ success: true, message: "Revoke Message Signed" });
    } catch (err: any) {
      setStatus({
        success: false,
        message: `Sign revoke failed: ${err.message}`,
      });
    }
  };

  const confirmRevoke = async () => {
    if (!(selectedGrant && revokeSiweMessage && revokeSignature && token)) {
      setStatus({ success: false, message: "Missing revoke requirements" });
      return;
    }
    setStatus({ message: "Revoking..." });

    try {
      const res = await fetch(
        `http://localhost:3001/api/access-grants/${selectedGrant.id}/revoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: revokeSiweMessage,
            signature: revokeSignature,
            reason: revokeReason || "Revoked by user",
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStatus({ success: true, message: "Access revoked successfully!" });
        setSelectedGrant(null);
        setRevokeSiweMessage("");
        setRevokeSignature("");
        setRevokeReason("");
        fetchGrants(); // Refresh list
      } else {
        throw new Error(data.message || "Revoke failed");
      }
    } catch (err: any) {
      setStatus({ success: false, message: `Revoke failed: ${err.message}` });
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Authentication (SIWE)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Connection */}
          <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
            <div>
              {isConnected ? (
                <div className="font-medium text-green-600">
                  Connected: {address}
                </div>
              ) : (
                <div className="font-medium text-red-500">Not Connected</div>
              )}
            </div>
            {isConnected ? (
              <Button onClick={() => disconnect()} variant="outline">
                Disconnect
              </Button>
            ) : (
              <Button onClick={() => connect({ connector: injected() })}>
                Connect Wallet
              </Button>
            )}
          </div>

          {/* JWT Input */}
          <div className="space-y-2">
            <Label htmlFor="token">
              JWT Token (Auto-filled after login or enter manually)
            </Label>
            <Input
              id="token"
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1Ni..."
              value={token}
            />
          </div>

          {/* SIWE Flow */}
          <div className="grid gap-4 rounded-lg border p-4">
            <div className="flex flex-wrap gap-2">
              <Button disabled={!isConnected} onClick={prepareSiweMessage}>
                1. Prepare Message
              </Button>
              <Button disabled={!siweMessage} onClick={signSiweMessage}>
                2. Sign Message
              </Button>
              <Button disabled={!signature || loading} onClick={loginWithSiwe}>
                3. Login
              </Button>
              <Button
                onClick={() => {
                  setSiweMessage("");
                  setSignature("");
                  setStatus(null);
                }}
                variant="outline"
              >
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Message to Sign</Label>
                <Textarea
                  className="h-32 font-mono text-xs"
                  placeholder="Message will appear here..."
                  readOnly
                  value={siweMessage}
                />
              </div>
              <div className="space-y-2">
                <Label>Signature</Label>
                <Textarea
                  className="h-32 font-mono text-xs"
                  placeholder="Signature will appear here..."
                  readOnly
                  value={signature}
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div
              className={`rounded-md p-4 ${
                status.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revoke Access Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grants List */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Active Grants</h3>
              <Button
                disabled={loading || !token}
                onClick={fetchGrants}
                size="sm"
                variant="ghost"
              >
                Refresh
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Grantee</TableHead>
                    <TableHead>Granted At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.length === 0 ? (
                    <TableRow>
                      <TableCell className="py-4 text-center" colSpan={4}>
                        {token
                          ? "No active grants found"
                          : "Enter token to view grants"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    grants.map((grant) => (
                      <TableRow key={grant.id}>
                        <TableCell>{grant.file.fileName}</TableCell>
                        <TableCell>
                          {grant.grantee.username} <br />
                          <span className="text-muted-foreground text-xs">
                            {grant.grantee.walletAddress}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(grant.grantedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              setSelectedGrant(grant);
                              setRevokeSiweMessage("");
                              setRevokeSignature("");
                              setStatus(null);
                            }}
                            size="sm"
                            variant={
                              selectedGrant?.id === grant.id
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedGrant?.id === grant.id
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Revoke Area */}
          {selectedGrant && (
            <div className="space-y-4 rounded-lg border bg-slate-50 p-6">
              <h3 className="font-semibold text-lg">
                Revoke Access for {selectedGrant.file.fileName}
              </h3>
              <div className="mb-4 text-muted-foreground text-sm">
                Grantee: {selectedGrant.grantee.username} (
                {selectedGrant.grantee.walletAddress})
              </div>

              <div className="mb-4">
                <Label>Revoke Reason (Optional)</Label>
                <Input
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Enter reason..."
                  value={revokeReason}
                />
              </div>

              <div className="grid gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={!isConnected}
                    onClick={prepareRevokeMessage}
                  >
                    1. Prepare Revoke Message
                  </Button>
                  <Button
                    disabled={!revokeSiweMessage}
                    onClick={signRevokeMessage}
                  >
                    2. Sign Revoke Message
                  </Button>
                  <Button
                    disabled={!revokeSignature}
                    onClick={confirmRevoke}
                    variant="destructive"
                  >
                    3. Confirm Revoke
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedGrant(null);
                      setRevokeSiweMessage("");
                      setRevokeSignature("");
                      setStatus(null);
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Revoke Message</Label>
                    <Textarea
                      className="h-32 font-mono text-xs"
                      placeholder="Revoke message will appear here..."
                      readOnly
                      value={revokeSiweMessage}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Revoke Signature</Label>
                    <Textarea
                      className="h-32 font-mono text-xs"
                      placeholder="Revoke signature will appear here..."
                      readOnly
                      value={revokeSignature}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
