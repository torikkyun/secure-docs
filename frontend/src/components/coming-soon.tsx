import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Construction, ArrowLeft } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

interface ComingSoonProps {
  title?: string
  description?: string
  backLink?: string
}

export function ComingSoon({
  title = "Tính năng đang phát triển",
  description = "Chúng tôi đang nỗ lực hoàn thiện tính năng này. Vui lòng quay lại sau!",
  backLink = "/dashboard" // Default fallback, though usually we might want to go back in history
}: ComingSoonProps) {
  const router = useRouter()

  return (
    <div className="flex h-[80vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-dashed">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <Construction className="h-10 w-10 text-muted-foreground animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-base pt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground">
             Đội ngũ phát triển đang làm việc chăm chỉ để mang đến trải nghiệm tốt nhất cho bạn.
           </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => router.navigate({ to: backLink })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang trước
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
