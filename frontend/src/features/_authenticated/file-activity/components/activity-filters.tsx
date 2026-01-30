import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Upload, Download, Share2, FileText } from 'lucide-react'

interface ActivityFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedAction: string
  onActionChange: (action: string) => void
  totalResults: number
  totalActivities: number
}

export function ActivityFilters({
  searchQuery,
  onSearchChange,
  selectedAction,
  onActionChange,
  totalResults,
  totalActivities,
}: ActivityFiltersProps) {
  const actionOptions = [
    { value: 'all', label: 'All Activities', icon: FileText },
    { value: 'upload', label: 'Uploads', icon: Upload },
    { value: 'download', label: 'Downloads', icon: Download },
    { value: 'share', label: 'Shares', icon: Share2 },
  ]

  const clearFilters = () => {
    onSearchChange('')
    onActionChange('all')
  }

  const hasFilters = searchQuery || selectedAction !== 'all'

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-end flex-1">
            {/* Search */}
            <div className="flex-1 max-w-sm">
              <label className="text-sm font-medium mb-2 block">Search Activities</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by filename or user..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div className="min-w-[180px]">
              <label className="text-sm font-medium mb-2 block">Filter by Action</label>
              <Select value={selectedAction} onValueChange={onActionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All activities" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {totalResults} of {totalActivities} activities
            </div>
            {hasFilters && (
              <div className="flex gap-1">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {selectedAction !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Action: {actionOptions.find(opt => opt.value === selectedAction)?.label}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}