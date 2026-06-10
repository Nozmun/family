import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SubPage } from '../components/SubPage'
import { uid, useAppDispatch, useAppState } from '../store'
import type { MaintenancePriority } from '../types'

export function MaintenanceForm() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const presetProperty = params.get('propertyId') ?? state.properties[0]?.id ?? ''
  const [propertyId, setPropertyId] = useState(presetProperty)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<MaintenancePriority>('Medium')
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter a short title for the issue.')
      return
    }
    if (!propertyId) {
      setError('Please choose a property.')
      return
    }
    dispatch({
      type: 'addMaintenance',
      issue: {
        id: uid(),
        propertyId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'Open',
        reportedAt: new Date().toISOString(),
      },
    })
    dispatch({
      type: 'addNotification',
      notification: {
        id: uid(),
        kind: 'maintenance',
        title: 'Maintenance issue reported',
        body: `${title.trim()} (${priority} priority)`,
        createdAt: new Date().toISOString(),
        read: false,
      },
    })
    navigate('/maintenance')
  }

  return (
    <SubPage title="Report Issue">
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="m-property">Property</label>
          <select
            id="m-property"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          >
            {state.properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="m-title">Issue title</label>
          <input
            id="m-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Boiler not heating"
          />
        </div>
        <div className="field">
          <label htmlFor="m-desc">Description</label>
          <textarea
            id="m-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem…"
          />
        </div>
        <div className="field">
          <label htmlFor="m-priority">Priority</label>
          <select
            id="m-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </div>
        {error && <div className="error-text" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Report Issue
        </button>
      </form>
    </SubPage>
  )
}
