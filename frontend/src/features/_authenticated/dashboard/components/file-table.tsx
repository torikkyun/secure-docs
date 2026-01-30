import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown, FileText, Lock } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Mock data type based on requirements + API shape
export type FileData = {
  id: string
  name: string
  size: number
  type: string
  owner: string
  uploadDate: string
  status: 'encrypted' | 'safe'
  blockchainTxHash?: string
}

const data: FileData[] = [
  {
    id: '1',
    name: 'financial_report_q4.pdf',
    size: 2450000,
    type: 'application/pdf',
    owner: 'admin@securedocs.com',
    uploadDate: '2023-10-25T10:30:00Z',
    status: 'encrypted',
    blockchainTxHash: '0xabc123...',
  },
  {
    id: '2',
    name: 'project_alpha_specs.docx',
    size: 1200000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    owner: 'alice@securedocs.com',
    uploadDate: '2023-10-24T14:15:00Z',
    status: 'encrypted',
  },
   {
    id: '3',
    name: 'employee_handbook.pdf',
    size: 5600000,
    type: 'application/pdf',
    owner: 'hr@securedocs.com',
    uploadDate: '2023-10-20T09:00:00Z',
    status: 'safe', // Maybe indicates verified/scanned? Using as placeholder
    blockchainTxHash: '0xdef456...',
  },
   {
    id: '4',
    name: 'design_assets_v2.zip',
    size: 15400000,
    type: 'application/zip',
    owner: 'design@securedocs.com',
    uploadDate: '2023-10-26T11:20:00Z',
    status: 'encrypted',
  },
]

export const columns: ColumnDef<FileData>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          File Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue('name')}</span>
        </div>
    ),
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => {
        const size = parseFloat(row.getValue('size'))
        const formatted = (size / 1024 / 1024).toFixed(2) + ' MB'
        return <div className="font-mono text-xs">{formatted}</div>
    },
  },
  {
      accessorKey: 'owner',
      header: 'Owner',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
            <Badge variant={status === 'encrypted' ? 'secondary' : 'default'} className="capitalize">
                {status === 'encrypted' && <Lock className="mr-1 h-3 w-3" />}
                {status}
            </Badge>
        )
    },
  },
  {
      accessorKey: 'blockchainTxHash',
      header: 'Blockchain',
      cell: ({ row }) => {
          const hash = row.getValue('blockchainTxHash') as string
          if (!hash) return <span className="text-muted-foreground text-xs text-center block">-</span>

          return (
              <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                  <img src="https://etherscan.io/images/brandassets/etherscan-logo-circle.svg" className="h-4 w-4" alt="Etherscan" />
                  Sepolia
              </a>
          )
      }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy File ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function FileTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter files..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
