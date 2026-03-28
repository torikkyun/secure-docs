import { getCurrentUserFn } from '@/api/user/functions'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
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
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'
import { cn } from '@/lib/utils'
import { UploadFileForm } from './-components/upload-file-form'
import { DetailBar } from './-components/detail-bar'
import {
  FileFilters,
  FileTypeFilter,
  PersonFilter,
} from './-components/file-filters'
import { useRouterState } from '@tanstack/react-router'
import { FileItem } from '@/api/file/types'

interface DetailBarContextValue {
  isOpen: boolean
  toggle: () => void
  selectedFile: FileItem | null
  setSelectedFile: (file: FileItem | null) => void
  viewMode: 'list' | 'grid'
  setViewMode: (mode: 'list' | 'grid') => void
  fileType: FileTypeFilter | undefined
  setFileType: (type: FileTypeFilter | undefined) => void
  selectedPerson: PersonFilter | null
  setSelectedPerson: (person: PersonFilter | null) => void
  knownPeople: Map<string, PersonFilter>
  setKnownPeople: Dispatch<SetStateAction<Map<string, PersonFilter>>>
}

export const DetailBarContext = createContext<DetailBarContextValue>({
  isOpen: false,
  toggle: () => {},
  selectedFile: null,
  setSelectedFile: () => {},
  viewMode: 'list',
  setViewMode: () => {},
  fileType: undefined,
  setFileType: () => {},
  selectedPerson: null,
  setSelectedPerson: () => {},
  knownPeople: new Map(),
  setKnownPeople: () => {},
})

export function useDetailBar() {
  return useContext(DetailBarContext)
}

const navigation = [
  // { name: 'Trang chủ', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tài liệu của tôi', href: '/files', icon: FileText },
  { name: 'Được chia sẻ với tôi', href: '/shared', icon: Share2 },
  { name: 'Hoạt động gần đây', href: '/file-activity', icon: FileClock },
  { name: 'Cài đặt cá nhân', href: '/settings', icon: Settings },
]

function PageToolbar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const {
    isOpen,
    toggle,
    viewMode,
    setViewMode,
    fileType,
    setFileType,
    selectedPerson,
    setSelectedPerson,
    knownPeople,
  } = useDetailBar()
  const currentNav = navigation.find(
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
  const showViewToggle = isFilesPage || isSharedPage || isActivityPage

  return (
    <div className="sticky bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight py-4">
          {currentNav.name}
        </h1>
        <div className="flex items-center gap-1">
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
            className={cn(isOpen ? 'bg-muted mr-5' : 'mr-3')}
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
            selectedPerson={selectedPerson}
            availablePeople={Array.from(knownPeople.values())}
            onFileTypeChange={setFileType}
            onPersonChange={setSelectedPerson}
          />
        </div>
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
  const currentPath = useRouterState({ select: (s) => s.location.pathname })
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isDetailBarOpen, setIsDetailBarOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [fileType, setFileType] = useState<FileTypeFilter | undefined>(
    undefined,
  )
  const [selectedPerson, setSelectedPerson] = useState<PersonFilter | null>(
    null,
  )
  const [knownPeople, setKnownPeople] = useState<Map<string, PersonFilter>>(
    new Map(),
  )

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
        </nav>
      </div>
    </div>
  )

  return (
    <DetailBarContext.Provider
      value={{
        isOpen: isDetailBarOpen,
        toggle: () => setIsDetailBarOpen((v) => !v),
        selectedFile,
        setSelectedFile,
        viewMode,
        setViewMode,
        fileType,
        setFileType,
        selectedPerson,
        setSelectedPerson,
        knownPeople,
        setKnownPeople,
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
          <div className="flex flex-1 overflow-hidden min-h-0">
            <main className="flex flex-1 flex-col pl-4 lg:pl-6 overflow-hidden bg-background min-h-0">
              <PageToolbar />
              <div className="flex-1 overflow-y-auto px-1 pb-2">
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
              &copy; {new Date().getFullYear()} SecureDocs. All rights reserved.
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
  )
}
