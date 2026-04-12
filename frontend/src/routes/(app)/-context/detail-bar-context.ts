import { createContext, useContext, Dispatch, SetStateAction } from 'react'
import type {
  FileTypeFilter,
  FileClassification,
  PersonFilter,
} from '@/routes/(app)/-components/file-filters'
import type { FileItem } from '@/api/file/types'
import type { AdminUser } from '@/api/admin/types'
import type { FileActivityAction } from '@/api/file-activity/schemas'

export interface DetailBarContextValue {
  isOpen: boolean
  toggle: () => void
  selectedFile: FileItem | null
  setSelectedFile: (file: FileItem | null) => void
  selectedUser: AdminUser | null
  setSelectedUser: (user: AdminUser | null) => void
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
}

export const DetailBarContext = createContext<DetailBarContextValue>({
  isOpen: false,
  toggle: () => {},
  selectedFile: null,
  setSelectedFile: () => {},
  selectedUser: null,
  setSelectedUser: () => {},
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
})

export function useDetailBar() {
  return useContext(DetailBarContext)
}
