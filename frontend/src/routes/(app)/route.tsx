import { getCurrentUserFn } from '@/api/user/functions'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import {
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
  PanelRightOpen,
  PanelRightClose,
  LayoutGrid,
  List,
  Users,
  UsersRound,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUnresolvedAlertCountFn } from '@/api/admin/functions'
import { cn } from '@/lib/utils'
import { UploadFileForm } from './-components/upload-file-form'
import { DetailBar } from './-components/detail-bar'
import {
  FileFilters,
  FileTypeFilter,
  FileClassification,
  PersonFilter,
} from './-components/filters/file-filters'
import { ActivityFilters } from './-components/filters/activity-filters'
import { AlertFilters } from './-components/filters/alert-filters'
import { UserFilters } from './-components/filters/user-filters'
import { DetailBarContext, useDetailBar } from './-context/detail-bar-context'
import type { FileItem } from '@/api/file/types'
import type {
  AdminUser,
  AnomalyAlert,
  AlertLevel,
  AlertType,
} from '@/api/admin/types'
import type { FileActivityAction } from '@/api/file-activity/schemas'
import { getAvatarUrl } from '@/lib/avatar-utils'
import { KeySyncWarning } from './settings/-components/key-sync-warning'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Local .sdoc file viewer (Tauri "Open with" integration) ──────────────────

const LazyPdfViewer = lazy(() => import('./files/-components/pdf-viewer'))

function getLocalDisplayName(filePath: string): string {
  const basename = filePath.replace(/\\/g, '/').split('/').pop() ?? filePath
  return basename.endsWith('.sdoc') ? basename.slice(0, -5) : basename
}

function getLocalMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

function LocalFileViewerModal({
  filePath,
  onClose,
}: {
  filePath: string | null
  onClose: () => void
}) {
  const isOpen = filePath !== null
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageWidth, setPageWidth] = useState(800)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayName = filePath ? getLocalDisplayName(filePath) : ''

  useEffect(() => {
    if (!filePath) return
    setIsLoading(true)
    setError(null)
    setPdfBuffer(null)
    setImgUrl(null)
    setNumPages(0)
    setCurrentPage(1)

    import('@tauri-apps/api/core').then(({ invoke }) => {
      ;(
        invoke as (
          cmd: string,
          args: Record<string, unknown>,
        ) => Promise<number[]>
      )('open_secure_file', { filePath })
        .then((bytes) => {
          const buffer = new Uint8Array(bytes)
          const mimeType = getLocalMimeType(getLocalDisplayName(filePath))
          if (mimeType === 'application/pdf') {
            setPdfBuffer(buffer.buffer)
          } else {
            const blob = new Blob([buffer], { type: mimeType })
            setImgUrl(URL.createObjectURL(blob))
          }
        })
        .catch((err: unknown) => setError(String(err)))
        .finally(() => setIsLoading(false))
    })
  }, [filePath])

  useEffect(() => {
    if (!pdfBuffer || !containerRef.current) return
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.clientWidth - 32)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [pdfBuffer])

  const handleClose = () => {
    if (imgUrl) URL.revokeObjectURL(imgUrl)
    setPdfBuffer(null)
    setImgUrl(null)
    setError(null)
    setNumPages(0)
    setCurrentPage(1)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="truncate">
            {displayName || 'File bảo mật'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-24">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-muted-foreground">Đang giải mã…</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
              <ShieldAlert className="h-12 w-12 text-destructive/60" />
              <p className="font-medium text-destructive">Không thể mở file</p>
              <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
            </div>
          )}
          {pdfBuffer && !isLoading && (
            <div ref={containerRef} className="flex flex-col items-center p-4">
              <Suspense
                fallback={
                  <div className="flex items-center gap-2 py-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Đang tải PDF…</span>
                  </div>
                }
              >
                <LazyPdfViewer
                  data={pdfBuffer}
                  currentPage={currentPage}
                  pageWidth={pageWidth}
                  onLoadSuccess={setNumPages}
                />
              </Suspense>
            </div>
          )}
          {imgUrl && !isLoading && (
            <div className="flex items-center justify-center p-4">
              <img
                src={imgUrl}
                alt={displayName}
                className="max-h-[70vh] max-w-full rounded object-contain"
              />
            </div>
          )}
        </div>

        {pdfBuffer && numPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t px-6 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= numPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

const navigation = [
  // { name: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tài liệu của tôi', href: '/files', icon: FileText },
  { name: 'Được chia sẻ với tôi', href: '/shared', icon: Share2 },
  { name: 'Hoạt động gần đây', href: '/file-activity', icon: FileClock },
  { name: 'Cài đặt cá nhân', href: '/settings', icon: Settings },
]

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

const allNavigation = [...navigation, ...adminNavigation]

function PageToolbar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const {
    isOpen,
    toggle,
    viewMode,
    setViewMode,
    fileType,
    setFileType,
    classification,
    setClassification,
    selectedPerson,
    setSelectedPerson,
    knownPeople,
    activityAction,
    setActivityAction,
    alertLevel,
    setAlertLevel,
    alertType,
    setAlertType,
    alertUnresolvedOnly,
    setAlertUnresolvedOnly,
    userRole,
    setUserRole,
    userStatus,
    setUserStatus,
  } = useDetailBar()
  const currentNav = allNavigation.find(
    (item) =>
      currentPath === item.href || currentPath.startsWith(item.href + '/'),
  )
  if (!currentNav) return null

  const isFilesPage =
    currentPath === '/files' || currentPath.startsWith('/files/')
  const isSharedPage =
    currentPath === '/shared' || currentPath.startsWith('/shared/')
  const isActivityPage =
    currentPath === '/file-activity' ||
    currentPath.startsWith('/file-activity/')
  const isSettingsPage =
    currentPath === '/settings' || currentPath.startsWith('/settings/')
  const isAlertsPage =
    currentPath === '/alerts' || currentPath.startsWith('/alerts/')
  const isUsersPage =
    currentPath === '/users' || currentPath.startsWith('/users/')
  const showViewToggle = isFilesPage || isSharedPage
  const showDetailBarToggle = !isActivityPage && !isSettingsPage

  return (
    <div className="sticky bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight py-4">
          {currentNav.name}
        </h1>
        <div className={cn('flex items-center gap-1')}>
          {showViewToggle && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="Dạng danh sách"
                className={cn('h-8 w-8', viewMode === 'list' && 'bg-muted')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Dạng lưới"
                className={cn('h-8 w-8', viewMode === 'grid' && 'bg-muted')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={isOpen ? 'Đóng bảng chi tiết' : 'Mở bảng chi tiết'}
            className={cn(
              isOpen ? 'bg-muted mr-5' : 'mr-5',
              !showDetailBarToggle && 'hidden',
            )}
          >
            {isOpen ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      {(isFilesPage || isSharedPage) && (
        <div className="pb-2">
          <FileFilters
            fileType={fileType}
            classification={classification}
            selectedPerson={selectedPerson}
            availablePeople={Array.from(knownPeople.values())}
            onFileTypeChange={setFileType}
            onClassificationChange={setClassification}
            onPersonChange={setSelectedPerson}
          />
        </div>
      )}
      {isActivityPage && (
        <ActivityFilters
          activityAction={activityAction}
          onActivityActionChange={setActivityAction}
        />
      )}
      {isAlertsPage && (
        <AlertFilters
          level={alertLevel}
          type={alertType}
          unresolvedOnly={alertUnresolvedOnly}
          onLevelChange={setAlertLevel}
          onTypeChange={setAlertType}
          onUnresolvedOnlyChange={setAlertUnresolvedOnly}
        />
      )}
      {isUsersPage && (
        <UserFilters
          userRole={userRole}
          userStatus={userStatus}
          onRoleChange={setUserRole}
          onStatusChange={setUserStatus}
        />
      )}
    </div>
  )
}

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

  const { data: alertCount } = useQuery({
    queryKey: ['admin', 'alerts', 'unresolved-count'],
    queryFn: getUnresolvedAlertCountFn,
    refetchInterval: 60_000,
    enabled: user?.role?.name === 'admin',
  })
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const [isDetailBarOpen, setIsDetailBarOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [fileType, setFileType] = useState<FileTypeFilter | undefined>(
    undefined,
  )
  const [classification, setClassification] = useState<
    FileClassification | undefined
  >(undefined)
  const [selectedPerson, setSelectedPerson] = useState<PersonFilter | null>(
    null,
  )
  const [knownPeople, setKnownPeople] = useState<Map<string, PersonFilter>>(
    new Map(),
  )

  const [activityAction, setActivityAction] = useState<
    FileActivityAction | undefined
  >(undefined)
  const [alertLevel, setAlertLevel] = useState<'all' | AlertLevel>('all')
  const [alertType, setAlertType] = useState<'all' | AlertType>('all')
  const [alertUnresolvedOnly, setAlertUnresolvedOnly] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'user' | ''>(
    '',
  )
  const [userStatus, setUserStatus] = useState<'active' | 'banned' | ''>('')
  const [userSortBy, setUserSortBy] = useState<
    'name' | 'createdAt' | 'ownedFiles'
  >('createdAt')
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc')

  // Tauri: open a .sdoc file from Windows Explorer "Open with"
  const [localFilePath, setLocalFilePath] = useState<string | null>(null)
  useEffect(() => {
    const isTauri =
      typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
    if (!isTauri) return
    let unlisten: (() => void) | undefined
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<string>('open-secure-file', (event) => {
        setLocalFilePath(event.payload)
      }).then((fn) => {
        unlisten = fn
      })
    })
    return () => {
      unlisten?.()
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userPublicKey')
    localStorage.removeItem('encryptedPrivateKey')
    routerInstance.navigate({ to: '/login' })
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center border-b px-6 lg:h-15">
        <Link to="/files" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg">Secure Docs</span>
        </Link>
      </div>
      <div className={cn('lg:px-4 mt-2 px-2')}>
        <Button
          onClick={() => setIsUploadOpen(true)}
          className={'justify-start gap-2 h-10'}
          size="lg"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Mới</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
          {navigation.map((item) => {
            const isActive =
              currentPath === item.href ||
              currentPath.startsWith(item.href + '/')
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
                {item.name}
              </Link>
            )
          })}
          {(user?.role?.name === 'admin' || user?.role?.name === 'manager') && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  Quản lý
                </p>
              </div>
              {adminNavigation
                .filter(
                  (item) => !item.adminOnly || user?.role?.name === 'admin',
                )
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
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-primary' : '',
                        )}
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
            </>
          )}
        </nav>
      </div>
    </div>
  )

  return (
    <>
      <DetailBarContext.Provider
        value={{
          isOpen: isDetailBarOpen,
          toggle: () => setIsDetailBarOpen((v) => !v),
          selectedFile,
          setSelectedFile: (file) => {
            setSelectedFile(file)
            if (file) setSelectedUser(null)
          },
          selectedUser,
          setSelectedUser: (user) => {
            setSelectedUser(user)
            if (user) {
              setSelectedFile(null)
              setSelectedAlert(null)
            }
          },
          selectedAlert,
          setSelectedAlert: (alert) => {
            setSelectedAlert(alert)
            if (alert) {
              setSelectedFile(null)
              setSelectedUser(null)
            }
          },
          viewMode,
          setViewMode,
          fileType,
          setFileType,
          classification,
          setClassification,
          selectedPerson,
          setSelectedPerson,
          knownPeople,
          setKnownPeople,
          activityAction,
          setActivityAction,
          alertLevel,
          setAlertLevel,
          alertType,
          setAlertType,
          alertUnresolvedOnly,
          setAlertUnresolvedOnly,
          userRole,
          setUserRole,
          userStatus,
          setUserStatus,
          userSortBy,
          setUserSortBy,
          userSortOrder,
          setUserSortOrder,
        }}
      >
        <div className="grid h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
          {isUploadOpen && (
            <UploadFileForm onClose={() => setIsUploadOpen(false)} />
          )}
          <div className="hidden border-r bg-background md:block dark:bg-zinc-950/50">
            <SidebarContent />
          </div>
          <div className="flex flex-col overflow-hidden min-h-0 h-full">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-15 lg:px-6 shrink-0 z-10">
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
                <SheetContent side="left" className="flex flex-col w-60 p-0">
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
                        'relative h-9 flex items-center gap-2 px-2 hover:bg-muted outline-none',
                      )}
                    >
                      <Avatar className="h-6 w-6 border">
                        <AvatarImage
                          src={getAvatarUrl(user.avatar)}
                          alt={user.email}
                        />
                        <AvatarFallback>
                          {user.email?.substring(0, 2).toUpperCase() ?? '?'}
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
                ) : (
                  <Link to="/login">
                    <Button size="sm">Đăng nhập</Button>
                  </Link>
                )}
              </div>
            </header>
            <div className="px-4 lg:px-6 shrink-0 mt-5">
              <KeySyncWarning />
            </div>
            <div className="flex flex-1 overflow-hidden min-h-0">
              <main className="flex flex-1 flex-col pl-4 lg:pl-6 overflow-hidden bg-background min-h-0">
                <PageToolbar />
                <div className="flex-1 overflow-y-auto pb-2">
                  <Outlet />
                </div>
              </main>
              <aside
                className={cn(
                  'w-80 shrink-0 border-l bg-background overflow-y-auto',
                  !isDetailBarOpen && 'hidden',
                )}
              >
                <DetailBar />
              </aside>
            </div>
            <footer className="mt-auto py-3 px-6 border-t bg-background flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground shrink-0">
              <p>
                &copy; {new Date().getFullYear()} SecureDocs. All rights
                reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground transition-colors">
                  Bảo mật
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Điều khoản
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Trợ giúp
                </a>
              </div>
            </footer>
          </div>
        </div>
      </DetailBarContext.Provider>
      <LocalFileViewerModal
        filePath={localFilePath}
        onClose={() => setLocalFilePath(null)}
      />
    </>
  )
}
