import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PropertyCard } from '../components/PropertyCard'
import { PlusIcon } from '../components/icons'
import { useAppDispatch, useAppState } from '../store'

export function Properties() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const confirmTarget = state.properties.find((p) => p.id === confirmId)

  return (
    <div className="page">
      <div className="page-title-row">
        <h1>My Properties</h1>
        <Link to="/properties/new" className="new-link">
          New <PlusIcon size={16} />
        </Link>
      </div>
      <p className="page-sub">
        Showing {state.properties.length}{' '}
        {state.properties.length === 1 ? 'property' : 'properties'}.
      </p>

      <div className="section" style={{ marginTop: 0 }}>
        {state.properties.length === 0 && (
          <div className="card empty">
            No properties yet. Tap “New” to add your first property.
          </div>
        )}
        {state.properties.map((p) => (
          <div key={p.id} style={{ marginBottom: 14 }}>
            <PropertyCard property={p} onDelete={(id) => setConfirmId(id)} />
          </div>
        ))}
      </div>

      {confirmTarget && (
        <div className="section">
          <div className="card" role="alertdialog" aria-label="Confirm delete">
            <div className="list-item-head">Delete this property?</div>
            <div className="list-item-body">
              {confirmTarget.address} and all of its viewings, applications, agreements
              and maintenance records will be removed.
            </div>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button
                className="btn btn-danger btn-small"
                onClick={() => {
                  dispatch({ type: 'deleteProperty', id: confirmTarget.id })
                  setConfirmId(null)
                }}
              >
                Delete
              </button>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
