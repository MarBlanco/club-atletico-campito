import type { PropsWithChildren } from 'react'

function FilterBar({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  )
}

export default FilterBar