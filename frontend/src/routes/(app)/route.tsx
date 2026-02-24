import { getCurrentUserFn } from '@/api/user/functions'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import {
  LayoutDashboard,
  FileText,
  Share2,
  Settings,
  Menu,
  Shield,
  FileClock,
  LogOut,
  User,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UploadFileForm } from './files/-components/upload-file-form'
import { useRouterState } from '@tanstack/react-router'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tài liệu của tôi', href: '/files', icon: FileText },
  { name: 'Được chia sẻ', href: '/shared', icon: Share2 },
  { name: 'Hoạt động', href: '/file-activity', icon: FileClock },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
]

export const Route = createFileRoute('/(app)')({
  loader: async () => {
    try {
      const user = await getCurrentUserFn()
      return { user }
    } catch (err) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const data = Route.useLoaderData()
  const user = data?.user
  const routerInstance = useRouter()
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('userPublicKey')
    localStorage.removeItem('encryptedPrivateKey')
    routerInstance.navigate({ to: '/login' })
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg">SecureDocs</span>
        </Link>
      </div>
      <div className="px-4 mt-2">
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="justify-start gap-2 h-10"
          variant="outline"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          Mới
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
          {navigation.map((item) => {
            const isActive =
              currentPath === item.href ||
              currentPath.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all outline-none ring-primary/50 focus-visible:ring-2',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )

  return (
    <div className="grid h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden bg-muted/40">
      {isUploadOpen && (
        <UploadFileForm onClose={() => setIsUploadOpen(false)} />
      )}
      <div className="hidden border-r bg-background md:block dark:bg-zinc-950/50">
        <SidebarContent />
      </div>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 shrink-0 z-10">
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'shrink-0 md:hidden',
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[240px] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'relative h-9 flex items-center gap-2 rounded-full px-2 hover:bg-muted outline-none',
                  )}
                >
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src="" alt={user.email} />
                    <AvatarFallback>
                      {user.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline-block max-w-[150px] truncate">
                    {user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || 'Người dùng'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() =>
                        routerInstance.navigate({ to: '/settings' })
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Tài khoản</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        routerInstance.navigate({ to: '/settings' })
                      }
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Cài đặt</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500 font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm">Đăng nhập</Button>
              </Link>
            )}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto bg-background/50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
