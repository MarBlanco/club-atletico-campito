function Footer({ text }: { text: string }) {
  return (
    <footer style={{
      padding: '16px 24px',
      textAlign: 'center',
      color: '#6b7280',
      fontSize: 13,
      borderTop: '1px solid #e5e7eb',
      background: '#ffffff',
    }}>
      {text}
    </footer>
  )
}

export default Footer