export interface DriveFile {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  items?: number;
  modifiedAt: string;
  shared?: boolean;
  starred?: boolean;
}

export const mockFiles: DriveFile[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    items: 12,
    modifiedAt: "2024-01-15",
    shared: false,
  },
  {
    id: "2",
    name: "Images",
    type: "folder",
    items: 50,
    modifiedAt: "2024-01-14",
    shared: true,
  },
  {
    id: "3",
    name: "Project Files",
    type: "folder",
    items: 8,
    modifiedAt: "2024-01-13",
  },
  {
    id: "4",
    name: "Presentation.pptx",
    type: "file",
    size: "2.5 MB",
    modifiedAt: "2024-01-12",
    shared: true,
  },
  {
    id: "5",
    name: "Budget.xlsx",
    type: "file",
    size: "1.2 MB",
    modifiedAt: "2024-01-11",
  },
  {
    id: "6",
    name: "Report.pdf",
    type: "file",
    size: "3.7 MB",
    modifiedAt: "2024-01-10",
    starred: true,
  },
  {
    id: "7",
    name: "Meeting Notes.docx",
    type: "file",
    size: "500 KB",
    modifiedAt: "2024-01-09",
  },
  {
    id: "8",
    name: "Videos",
    type: "folder",
    items: 15,
    modifiedAt: "2024-01-08",
    shared: true,
  },
];
