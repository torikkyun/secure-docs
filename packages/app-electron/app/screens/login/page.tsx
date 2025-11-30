"use client";

import { MetaMaskSDK } from "@metamask/sdk";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { authService } from "../../services/auth.service";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const router = useRouter();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Wallet state
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [sdk, setSdk] = useState<MetaMaskSDK | null>(null);

  // Register state
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: "Secure Docs",
            url: window.location.href,
          },
          checkInstallationImmediately: false,
        });
        setSdk(MMSDK);
      } catch (error) {
        console.error("Failed to initialize MetaMask SDK:", error);
      }
    };
    initSDK();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { loginEmail, loginPassword });
    router.push("/screens/dashboard");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    if (!agreeTerms) {
      alert("Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }
    console.log("Register:", registerData);
    setActiveTab("login");
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const getProvider = () => {
    if (!sdk) return null;
    return sdk.getProvider();
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const ethereum = getProvider();

      if (!ethereum) {
        alert("Đang khởi tạo MetaMask SDK, vui lòng thử lại sau giây lát.");
        return;
      }

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Lỗi kết nối ví:", error);
      alert("Không thể kết nối ví via MetaMask.");
    } finally {
      setIsConnecting(false);
    }
  };

  const signInWithEthereum = async () => {
    if (!walletAddress) {
      await connectWallet();
      // If still no address after connect attempt (e.g. user rejected), return
      // Note: connectWallet is async, so we need to check state or return value.
      // Since state updates are async, it's better to get address directly if possible,
      // but here we rely on the flow. Let's re-check provider.
    }

    // We need to get the address *again* or ensure state is updated.
    // Best to re-fetch from provider to be sure.
    const ethereum = getProvider();
    if (!ethereum) return;

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(ethereum as any);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Update state just in case
      setWalletAddress(address);

      // 1. Get Nonce
      const { nonce, expiresAt } = await authService.getNonce(address);

      // 2. Create SIWE Message
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = "Sign in with Ethereum to the app.";

      const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: "1",
        chainId: Number((await provider.getNetwork()).chainId),
        nonce,
        expirationTime: new Date(expiresAt).toISOString(),
      });

      const messageText = message.prepareMessage();

      // 3. Sign Message
      const signature = await signer.signMessage(messageText);

      // 4. Login API
      const response = await authService.login(address, messageText, signature);

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        router.push("/screens/dashboard");
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập ví:", error);
      if (error.response?.status === 409) {
        alert("Ví chưa được đăng ký. Vui lòng đăng ký trước.");
        setActiveTab("register");
      } else {
        alert("Đăng nhập thất bại: " + (error.message || "Lỗi không xác định"));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="-top-40 -right-40 absolute h-80 w-80 rounded-full bg-zinc-700/30 blur-3xl" />
        <div className="-bottom-40 -left-40 absolute h-80 w-80 rounded-full bg-zinc-700/30 blur-3xl" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-zinc-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-zinc-200/50 bg-white shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-b from-zinc-50 to-white px-8 pt-10 pb-6 text-center">
            <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 shadow-lg">
              <span className="material-icons text-4xl text-white">shield</span>
            </div>
            <h1 className="mb-2 font-bold text-3xl text-zinc-900">
              Secure Docs
            </h1>
            <p className="text-sm text-zinc-500">
              Quản lý tài liệu an toàn và bảo mật
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-zinc-50 px-8 py-4">
            <button
              className={`; - 1; - xl; px - 4; py - 3; font - semibold; text - sm; - all; duration - 300; $; { activeTab === "login" ? "bg-zinc-900 : "bg-white } flex rounded text-white text-zinc-600 shadow-lg shadow-zinc-900/30" transition hover:bg-zinc-100 hover:text-zinc-900";`}
              onClick={() => setActiveTab("login")}
            >
              Đăng nhập
            </button>
            <button
              className={`; - 1; - xl; px - 4; py - 3; font - semibold; text - sm; - all; duration - 300; $; { activeTab === "register" ? "bg-zinc-900 : "bg-white } flex rounded text-white text-zinc-600 shadow-lg shadow-zinc-900/30" transition hover:bg-zinc-100 hover:text-zinc-900";`}
              onClick={() => setActiveTab("register")}
            >
              Đăng ký
            </button>
          </div>

          <div className="bg-white p-8">
            {/* Login Form */}
            {activeTab === "login" && (
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="mb-2 block font-semibold text-sm text-zinc-900">
                    Email
                  </label>
                  <div className="group relative">
                    <div className="-translate-y-1/2 absolute top-1/2 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-focus-within:bg-zinc-100">
                      <span className="material-icons text-xl text-zinc-600">
                        email
                      </span>
                    </div>
                    <input
                      className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 py-4 pr-4 pl-20 outline-none transition-all hover:bg-white focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/10"
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      type="email"
                      value={loginEmail}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-sm text-zinc-900">
                    Mật khẩu
                  </label>
                  <div className="group relative">
                    <div className="-translate-y-1/2 absolute top-1/2 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-focus-within:bg-zinc-100">
                      <span className="material-icons text-xl text-zinc-600">
                        lock
                      </span>
                    </div>
                    <input
                      className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 py-4 pr-14 pl-20 outline-none transition-all hover:bg-white focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/10"
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                    />
                    <button
                      className="-translate-y-1/2 absolute top-1/2 right-4 text-zinc-400 transition-colors hover:text-zinc-700"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      type="button"
                    >
                      <span className="material-icons text-xl">
                        {showLoginPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="group flex cursor-pointer items-center">
                    <input
                      className="h-4 w-4 cursor-pointer rounded border-2 border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20"
                      type="checkbox"
                    />
                    <span className="ml-2 text-sm text-zinc-600 transition-colors group-hover:text-zinc-900">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <button
                    className="font-semibold text-sm text-zinc-900 transition-colors hover:text-zinc-700"
                    type="button"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  className="hover:-translate-y-0.5 w-full rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-700 py-4 font-semibold text-white shadow-lg shadow-zinc-900/30 transition-all hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl hover:shadow-zinc-900/40"
                  type="submit"
                >
                  Đăng nhập
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-zinc-100 border-t-2" />
                  </div>
                  <div className="relative flex justify-center font-semibold text-xs">
                    <span className="bg-white px-4 text-zinc-400 uppercase tracking-wider">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <button
                  className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-zinc-200 py-4 font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isConnecting}
                  onClick={signInWithEthereum}
                  type="button"
                >
                  {/* MetaMask Icon (Simplified SVG) */}
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.2031 3.96875L17.2031 13.9688L11.2031 9.96875L2.20312 16.9688L10.2031 22.9688L16.2031 28.9688L22.2031 22.9688L30.2031 16.9688L27.2031 3.96875Z"
                      fill="#E2761B"
                      stroke="#E2761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  {isConnecting
                    ? "Đang kết nối..."
                    : walletAddress
                      ? `;
Đăng;
nhập;
với;
$;
{
  walletAddress.slice(0, 6);
}
...$
{
  walletAddress.slice(-4);
}
`
                      : "Đăng nhập với MetaMask"}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                <div>
                  <label className="mb-2 block font-semibold text-sm text-zinc-900">
                    Họ và tên
                  </label>
                  <div className="group relative">
                    <div className="-translate-y-1/2 absolute top-1/2 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-focus-within:bg-zinc-100">
                      <span className="material-icons text-xl text-zinc-600">
                        person
                      </span>
                    </div>
                    <input
                      className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 py-4 pr-4 pl-20 outline-none transition-all hover:bg-white focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/10"
                      name="fullName"
                      onChange={handleRegisterChange}
                      placeholder="Nguyễn Văn A"
                      required
                      type="text"
                      value={registerData.fullName}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-sm text-zinc-900">
                    Email
                  </label>
                  <div className="group relative">
                    <div className="-translate-y-1/2 absolute top-1/2 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-focus-within:bg-zinc-100">
                      <span className="material-icons text-xl text-zinc-600">
                        email
                      </span>
                    </div>
                    <input
                      className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 py-4 pr-4 pl-20 outline-none transition-all hover:bg-white focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/10"
                      name="email"
                      onChange={handleRegisterChange}
                      placeholder="your@email.com"
                      required
                      type="email"
                      value={registerData.email}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-sm text-zinc-900">
                    Mật khẩu
                  </label>
                  <div className="group relative">
                    <div className="-translate-y-1/2 absolute top-1/2 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-focus-within:bg-zinc-100">
                      <span className="material-icons text-xl text-zinc-600">
                        lock
                      </span>
                    </div>
                    <input
                      className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 py-4 pr-14 pl-20 outline-none transition-all hover:bg-white focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/10"
                      minLength={8}
                      name="password"
                      onChange={handleRegisterChange}
                      placeholder="Tối thiểu 8 ký tự"
                      required
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.password}
                    />
                    <button
                      className="-translate-y-1/2 absolute top-1/2 right-4 text-zinc-400 transition-colors hover:text-zinc-700"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                      type="button"
                    >
                      <span className="material-icons text-xl">
                        {showRegisterPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-sm text-zinc-900">
                    Xác nhận mật khẩu
                  </label>
                  <div className="group relative">
                    <div className="-translate-y-1/2 absolute top-1/2 left-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-focus-within:bg-zinc-100">
                      <span className="material-icons text-xl text-zinc-600">
                        lock
                      </span>
                    </div>
                    <input
                      className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 py-4 pr-14 pl-20 outline-none transition-all hover:bg-white focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/10"
                      name="confirmPassword"
                      onChange={handleRegisterChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                    />
                    <button
                      className="-translate-y-1/2 absolute top-1/2 right-4 text-zinc-400 transition-colors hover:text-zinc-700"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      type="button"
                    >
                      <span className="material-icons text-xl">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start pt-2">
                  <input
                    checked={agreeTerms}
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-2 border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-900/20"
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    type="checkbox"
                  />
                  <label className="ml-3 text-sm text-zinc-600 leading-relaxed">
                    Tôi đồng ý với{" "}
                    <button
                      className="font-semibold text-zinc-900 transition-colors hover:text-zinc-700"
                      type="button"
                    >
                      Điều khoản sử dụng
                    </button>{" "}
                    và{" "}
                    <button
                      className="font-semibold text-zinc-900 transition-colors hover:text-zinc-700"
                      type="button"
                    >
                      Chính sách bảo mật
                    </button>
                  </label>
                </div>

                <button
                  className="hover:-translate-y-0.5 mt-6 w-full rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-700 py-4 font-semibold text-white shadow-lg shadow-zinc-900/30 transition-all hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl hover:shadow-zinc-900/40"
                  type="submit"
                >
                  Đăng ký
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-zinc-100 border-t-2" />
                  </div>
                  <div className="relative flex justify-center font-semibold text-xs">
                    <span className="bg-white px-4 text-zinc-400 uppercase tracking-wider">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>

                {/* Social Register */}
                <button
                  className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-zinc-200 py-4 font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isConnecting}
                  onClick={signInWithEthereum}
                  type="button"
                >
                  {/* MetaMask Icon (Simplified SVG) */}
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.2031 3.96875L17.2031 13.9688L11.2031 9.96875L2.20312 16.9688L10.2031 22.9688L16.2031 28.9688L22.2031 22.9688L30.2031 16.9688L27.2031 3.96875Z"
                      fill="#E2761B"
                      stroke="#E2761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  {isConnecting
                    ? "Đang kết nối..."
                    : walletAddress
                      ? `;
Đăng;
ký;
với;
$;
{
  walletAddress.slice(0, 6);
}
...$
{
  walletAddress.slice(-4);
}
`
                      : "Đăng ký với MetaMask"}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-8 text-center font-medium text-xs text-zinc-400">
          © 2025 Secure Docs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
