import { getCurrentUserFn } from '@/api/user/functions'
import { getUnresolvedAlertCountFn } from '@/api/admin/functions'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import {
  Shield,
  Users,
  UsersRound,
  AlertTriangle,
  LogOut,
  ChevronDown,
  User,
  Settings,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

const adminNavigation = [
  { name: 'Quản lý người dùng', href: '/users', icon: Users, adminOnly: true },
  { name: 'Quản lý nhóm', href: '/groups', icon: UsersRound, adminOnly: false },
  {
    name: 'Cảnh báo bất thường',
    href: '/alerts',
    icon: AlertTriangle,
    adminOnly: true,
  },
]

export const Route = createFileRoute('/(admin)')({
  loader: async () => {
    try {
      const user = await getCurrentUserFn()
      const roleName = user?.role?.name
      if (roleName !== 'admin' && roleName !== 'manager') {
        throw redirect({ to: '/files' })
      }
      return { user }
    } catch (err) {
      if (err && typeof err === 'object' && 'redirect' in err) throw err
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const data = Route.useLoaderData()
  const user = data?.user
  const routerInstance = useRouter()
  const currentPath = useRouterState({ select: (s) => s.location.pathname })

  const { data: alertCount } = useQuery({
    queryKey: ['admin', 'alerts', 'unresolved-count'],
    queryFn: getUnresolvedAlertCountFn,
    refetchInterval: 60_000,
  })

  const handleLogout = () => {
    localStorage.removeItem('userPublicKey')
    localStorage.removeItem('encryptedPrivateKey')
    routerInstance.navigate({ to: '/login' })
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center border-b px-6">
        <Link to="/groups" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg">Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
          {adminNavigation
            .filter((item) => !item.adminOnly || user?.role?.name === 'admin')
            .map((item) => {
              const isActive =
                currentPath === item.href ||
                currentPath.startsWith(item.href + '/')
              const isAlerts = item.href === '/alerts'
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all outline-none',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.icon
                    className={cn('h-4 w-4', isActive ? 'text-primary' : '')}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isAlerts && alertCount && alertCount.count > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-5 text-xs px-1"
                    >
                      {alertCount.count}
                    </Badge>
                  )}
                </Link>
              )
            })}
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/files"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Shield className="h-4 w-4" />
              <span>Về trang người dùng</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )

  return (
    <div className="grid h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
      <div className="hidden border-r bg-background md:block dark:bg-zinc-950/50">
        <SidebarContent />
      </div>
      <div className="flex flex-col overflow-hidden min-h-0 h-full">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-15 lg:px-6 shrink-0 z-10">
          <div className="w-full flex-1" />
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'relative h-9 flex items-center gap-2 px-2 hover:bg-muted outline-none',
                  )}
                >
                  <Avatar className="h-6 w-6 border">
                    <AvatarImage src={user.avatar} alt={user.email} />
                    <AvatarFallback>
                      {user.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium lg:inline-block max-w-37.5 truncate">
                    {user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || 'Admin'}
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
                      <User className="h-4 w-4" />
                      <span>Tài khoản</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        routerInstance.navigate({ to: '/settings' })
                      }
                    >
                      <Settings className="h-4 w-4" />
                      <span>Cài đặt</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
