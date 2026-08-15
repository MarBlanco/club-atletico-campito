import type { ReactNode } from 'react'

export interface DataTableColumn {
  key: string
  label: string
  width?: number
}

interface DataTableProps<T> {
  columns: DataTableColumn[]
  rows: T[]
  keyField: (row: T) => string
  renderCell: (row: T, column: DataTableColumn) => ReactNode
}

const thStyle: React.CSSProperties = {
  padding: '11px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#374151',
  verticalAlign: 'middle',
}

function DataTable<T>({ columns, rows, keyField, renderCell }: DataTableProps<T>) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {columns.map(column => (
                <th key={column.key} style={{ ...thStyle, width: column.width }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={keyField(row)}
                style={{ borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}
              >
                {columns.map(column => (
                  <td key={column.key} style={tdStyle}>
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable