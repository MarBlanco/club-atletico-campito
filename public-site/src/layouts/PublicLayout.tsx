import type { PropsWithChildren } from 'react'

function PublicLayout({ children }: PropsWithChildren) {
  return (
    <main>{children}</main>
  )
}

export default PublicLayout
