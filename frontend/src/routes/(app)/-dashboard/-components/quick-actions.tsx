import { Upload, Share2, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'

export function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Upload File',
      icon: Upload,
      description: 'Securely encrypt and upload new files',
      onClick: () => navigate({ to: '/_authenticated/files' }),
      variant: 'default' as const,
    },
    {
      label: 'Share File',
      icon: Share2,
      description: 'Share encrypted files with colleagues',
      onClick: () => navigate({ to: '/_authenticated/files' }),
      variant: 'outline' as const,
    },
    {
      label: 'Download',
      icon: Download,
      description: 'Access and decrypt your shared files',
      onClick: () => navigate({ to: '/_authenticated/files' }),
      variant: 'outline' as const,
    },
    {
      label: 'New Folder',
      icon: Plus,
      description: 'Organize files in folders',
      onClick: () => {}, // TODO: Implement folder creation
      variant: 'ghost' as const,
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="flex flex-col items-center gap-2 h-auto p-4 min-w-[120px]"
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}