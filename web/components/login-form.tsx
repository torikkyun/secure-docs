"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-lg border bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chào mừng trở lại
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Đăng nhập để truy cập tài liệu bảo mật của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg
                    className="mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="#4285F4"
                    />
                  </svg>
                )}
                {isLoading ? "Đang đăng nhập..." : "Tiếp tục với Google"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <Badge variant="secondary" className="px-3 py-1">
                  Đăng nhập an toàn và nhanh chóng
                </Badge>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="text-sm">
                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                      Bảo mật tối đa
                    </p>
                    <p className="text-blue-600 dark:text-blue-300 mt-1">
                      Chúng tôi không lưu trữ mật khẩu của bạn. Đăng nhập thông
                      qua Google để đảm bảo an toàn.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-muted-foreground">Mã hóa 256-bit</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-muted-foreground">OAuth 2.0</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-muted-foreground">GDPR</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-xs underline-offset-4"
            asChild
          >
            <a href="/terms">Điều khoản Dịch vụ</a>
          </Button>{" "}
          và{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-xs underline-offset-4"
            asChild
          >
            <a href="/privacy">Chính sách Bảo mật</a>
          </Button>{" "}
          của chúng tôi.
        </p>
      </div>
    </div>
  );
}
