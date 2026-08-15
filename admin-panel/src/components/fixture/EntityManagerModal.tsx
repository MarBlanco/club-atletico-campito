import { useState } from 'react'
import type { ID } from '../../types/common'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import ConfirmDialog from '../ui/ConfirmDialog'

export interface EntityItem {
  id: ID
  name: string
}

interface EntityManagerModalProps {
  title: string
  noun: string
  plural: string
  items: EntityItem[]
  getUsage: (id: string) => number
  onAdd: (name: string) => Promise<EntityItem | null>
  onUpdate: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    padding: '4px 10px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}

function EntityManagerModal({
  title,
  noun,
  plural,
  items,
  getUsage,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: EntityManagerModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<ID | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deletingId, setDeletingId] = useState<ID | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      const created = await onAdd(trimmed)
      if (created) setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSave(id: ID) {
    const trimmed = editingName.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      await onUpdate(id, trimmed)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(item: EntityItem) {
    const usage = getUsage(item.id)
    if (usage > 0) {
      setError(`No se puede eliminar: este ${noun} se utiliza en ${usage} partido${usage === 1 ? '' : 's'}.`)
      return
    }
    setError(null)
    setDeletingId(item.id)
  }

  async function handleDelete() {
    if (!deletingId) return
    setSaving(true)
    setError(null)
    try {
      await onDelete(deletingId)
      setDeletingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
      setDeletingId(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder={`Nombre del ${noun}`} required />
        <button type="submit" disabled={saving} style={actionBtn('#1a1a2e')}>
          Agregar
        </button>
      </form>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 12px' }} role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: 13 }}>No hay {plural} todavía.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => {
            const usage = getUsage(item.id)
            return (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '8px 12px',
                }}
              >
                {editingId === item.id ? (
                  <Input value={editingName} onChange={e => setEditingName(e.target.value)} autoFocus />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {usage > 0 && (
                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                      {usage} partido{usage === 1 ? '' : 's'}
                    </span>
                  )}
                  {editingId === item.id ? (
                    <>
                      <button type="button" onClick={() => handleEditSave(item.id)} disabled={saving} style={actionBtn('#3b82f6')}>
                        Guardar
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} style={actionBtn('#6b7280')}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id)
                          setEditingName(item.name)
                        }}
                        style={actionBtn('#3b82f6')}
                      >
                        Editar
                      </button>
                      <button type="button" onClick={() => requestDelete(item)} style={actionBtn('#ef4444')}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {deletingId && (
        <ConfirmDialog
          title={`Eliminar ${noun}`}
          message={`¿Eliminar este ${noun}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </Modal>
  )
}

export default EntityManagerModal