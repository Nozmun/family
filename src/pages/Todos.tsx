import { useState } from 'react'
import type { FormEvent } from 'react'
import { Chip } from '../components/Chip'
import { SubPage } from '../components/SubPage'
import { PlusIcon, ShieldIcon, TrashIcon } from '../components/icons'
import { uid, useAppDispatch, useAppState } from '../store'
import type { CertificateType } from '../types'
import { daysUntil, formatDate } from '../utils'

export function Todos() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [propertyId, setPropertyId] = useState(state.properties[0]?.id ?? '')
  const [certificateType, setCertificateType] = useState<CertificateType | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  const onAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter a task title.')
      return
    }
    dispatch({
      type: 'addTodo',
      todo: {
        id: uid(),
        title: title.trim(),
        detail: detail.trim(),
        propertyId: propertyId || undefined,
        certificateType: certificateType || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        done: false,
      },
    })
    setTitle('')
    setDetail('')
    setCertificateType('')
    setDueDate('')
    setError('')
    setAdding(false)
  }

  return (
    <SubPage
      title="To-Do"
      action={
        <button className="new-link" onClick={() => setAdding((a) => !a)}>
          {adding ? 'Close' : 'New'} {!adding && <PlusIcon size={16} />}
        </button>
      }
    >
      {adding && (
        <form className="form" onSubmit={onAdd} style={{ paddingTop: 4 }}>
          <div className="field">
            <label htmlFor="t-title">Title</label>
            <input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Renew EICR certificate"
            />
          </div>
          <div className="field">
            <label htmlFor="t-detail">Details</label>
            <input
              id="t-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Optional details…"
            />
          </div>
          <div className="field">
            <label htmlFor="t-property">Property</label>
            <select
              id="t-property"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">No property</option>
              {state.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>
          </div>
          <div className="btn-row">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="t-cert">Certificate</label>
              <select
                id="t-cert"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as CertificateType | '')}
              >
                <option value="">None</option>
                <option value="GSC">GSC (Gas Safety)</option>
                <option value="EICR">EICR (Electrical)</option>
                <option value="EPC">EPC (Energy)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="t-due">Due date</label>
              <input
                id="t-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          {error && <div className="error-text" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary">
            Add Task
          </button>
        </form>
      )}

      <div className="section" style={{ marginTop: 6 }}>
        {state.todos.length === 0 && (
          <div className="card empty">
            <span className="empty-icon">
              <ShieldIcon />
            </span>
            Nothing to do — you're all caught up
          </div>
        )}
        {state.todos.map((t) => {
          const prop = state.properties.find((p) => p.id === t.propertyId)
          const days = t.dueDate ? daysUntil(t.dueDate) : null
          return (
            <div key={t.id} className="list-item" style={{ opacity: t.done ? 0.55 : 1 }}>
              <div className="list-item-head">
                <input
                  type="checkbox"
                  checked={t.done}
                  aria-label={`Mark ${t.title} ${t.done ? 'not done' : 'done'}`}
                  onChange={() => dispatch({ type: 'toggleTodo', id: t.id })}
                />
                <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
                <span className="spacer" />
                {t.certificateType && <Chip label={t.certificateType} />}
                <button
                  className="delete-btn"
                  aria-label={`Delete ${t.title}`}
                  onClick={() => dispatch({ type: 'deleteTodo', id: t.id })}
                >
                  <TrashIcon size={17} />
                </button>
              </div>
              {t.detail && <div className="list-item-body">{t.detail}</div>}
              {t.dueDate && (
                <div className="list-item-sub">
                  Due {formatDate(t.dueDate)}
                  {days !== null && !t.done
                    ? days >= 0
                      ? ` — in ${days} day${days === 1 ? '' : 's'}`
                      : ` — overdue by ${-days} day${days === -1 ? '' : 's'}`
                    : ''}
                </div>
              )}
              {prop && <div className="list-item-sub">{prop.address}</div>}
            </div>
          )
        })}
      </div>
    </SubPage>
  )
}
