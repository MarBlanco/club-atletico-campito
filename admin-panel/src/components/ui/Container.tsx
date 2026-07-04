import type { PropsWithChildren } from 'react'

function Container({ children }: PropsWithChildren) {
  return (
    <div>{children}</div>
  )
}

export default Container
