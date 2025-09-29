import { Shield } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 flex flex-col items-center justify-center p-6 md:p-10">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Logo và Branding */}
        <div className="text-center">
          <Button
            variant="ghost"
            className="inline-flex items-center gap-3 font-bold text-xl text-foreground hover:text-primary transition-colors p-0 h-auto"
            asChild
          >
            <a href="/">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex size-10 items-center justify-center rounded-xl shadow-lg">
                <Shield className="size-5" />
              </div>
              SecureDocs
            </a>
          </Button>
          <p className="mt-3 text-muted-foreground text-sm">
            Nền tảng quản lý tài liệu bảo mật
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer Info */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href="/help">Trợ giúp</a>
            </Button>
            <span>•</span>
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href="/contact">Liên hệ</a>
            </Button>
            <span>•</span>
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href="/guide">Hướng dẫn</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
