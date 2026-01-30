import { AppSidebarLayout } from '@/components/layout/app-layout'
import { getCurrentUserFn } from '@/features/_authenticated/functions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  loader: async () => {
    try {
      const user = await getCurrentUserFn()
      return { user }
    } catch (err) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => {
    const data = Route.useLoaderData()
    const user = data?.user

    return (
      <AppSidebarLayout user={user}>
        <Outlet />
      </AppSidebarLayout>
    )
  },
})
