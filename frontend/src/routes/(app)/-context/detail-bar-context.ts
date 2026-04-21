import { createContext, useContext, Dispatch, SetStateAction } from 'react'
import type {
  FileTypeFilter,
  FileClassification,
  PersonFilter,
} from '@/routes/(app)/-components/filters/file-filters'
import type { FileItem } from '@/api/file/types'
import type {
  AdminUser,
  AnomalyAlert,
  AlertLevel,
  AlertType,
} from '@/api/admin/types'
import type { FileActivityAction } from '@/api/file-activity/schemas'

export interface DetailBarContextValue {
  isOpen: boolean
  toggle: () => void
  selectedFile: FileItem | null
  setSelectedFile: (file: FileItem | null) => void
  selectedUser: AdminUser | null
  setSelectedUser: (user: AdminUser | null) => void
  selectedAlert: AnomalyAlert | null
  setSelectedAlert: (alert: AnomalyAlert | null) => void
  viewMode: 'list' | 'grid'
  setViewMode: (mode: 'list' | 'grid') => void
  fileType: FileTypeFilter | undefined
  setFileType: (type: FileTypeFilter | undefined) => void
  classification: FileClassification | undefined
  setClassification: (c: FileClassification | undefined) => void
  selectedPerson: PersonFilter | null
  setSelectedPerson: (person: PersonFilter | null) => void
  knownPeople: Map<string, PersonFilter>
  setKnownPeople: Dispatch<SetStateAction<Map<string, PersonFilter>>>
  activityAction: FileActivityAction | undefined
  setActivityAction: (action: FileActivityAction | undefined) => void
  alertLevel: 'all' | AlertLevel
  setAlertLevel: (level: 'all' | AlertLevel) => void
  alertType: 'all' | AlertType
  setAlertType: (type: 'all' | AlertType) => void
  alertUnresolvedOnly: boolean
  setAlertUnresolvedOnly: (v: boolean) => void
  userRole: 'admin' | 'manager' | 'user' | ''
  setUserRole: (role: 'admin' | 'manager' | 'user' | '') => void
  userStatus: 'active' | 'banned' | ''
  setUserStatus: (status: 'active' | 'banned' | '') => void
  userSortBy: 'name' | 'createdAt' | 'ownedFiles'
  setUserSortBy: (sortBy: 'name' | 'createdAt' | 'ownedFiles') => void
  userSortOrder: 'asc' | 'desc'
  setUserSortOrder: (sortOrder: 'asc' | 'desc') => void
}

export const DetailBarContext = createContext<DetailBarContextValue>({
  isOpen: false,
  toggle: () => {},
  selectedFile: null,
  setSelectedFile: () => {},
  selectedUser: null,
  setSelectedUser: () => {},
  selectedAlert: null,
  setSelectedAlert: () => {},
  viewMode: 'list',
  setViewMode: () => {},
  fileType: undefined,
  setFileType: () => {},
  classification: undefined,
  setClassification: () => {},
  selectedPerson: null,
  setSelectedPerson: () => {},
  knownPeople: new Map(),
  setKnownPeople: () => {},
  activityAction: undefined,
  setActivityAction: () => {},
  alertLevel: 'all',
  setAlertLevel: () => {},
  alertType: 'all',
  setAlertType: () => {},
  alertUnresolvedOnly: false,
  setAlertUnresolvedOnly: () => {},
  userRole: '',
  setUserRole: () => {},
  userStatus: '',
  setUserStatus: () => {},
  userSortBy: 'createdAt',
  setUserSortBy: () => {},
  userSortOrder: 'desc',
  setUserSortOrder: () => {},
})

export function useDetailBar() {
  return useContext(DetailBarContext)
}
