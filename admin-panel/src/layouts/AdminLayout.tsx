import type { PropsWithChildren } from 'react'

function AdminLayout({ children }: PropsWithChildren) {
  return (
    <main>{children}</main>
  )
}

export default AdminLayout
