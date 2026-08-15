interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
}

function SearchBar({
  value,
  onChange,
  id = 'search-bar',
  placeholder = 'Buscar...',
}: SearchBarProps) {
  return (
    <input
      id={id}
      type="search"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Buscar"
      style={{
        padding: '9px 12px',
        border: '1px solid #d1d5db',
        borderRadius: 6,
        fontSize: 14,
        outline: 'none',
        width: 240,
        maxWidth: '100%',
        boxSizing: 'border-box',
        background: '#fff',
      }}
    />
  )
}

export default SearchBar