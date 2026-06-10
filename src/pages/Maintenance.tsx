import { Link } from 'react-router-dom'
import { Chip } from '../components/Chip'
import { SubPage } from '../components/SubPage'
import { PlusIcon, WrenchIcon } from '../components/icons'
import { useAppDispatch, useAppState } from '../store'
import type { MaintenanceStatus } from '../types'
import { formatDate } from '../utils'

const nextStatus: Record<MaintenanceStatus, MaintenanceStatus | null> = {
  Open: 'In Progress',
  'In Progress': 'Resolved',
  Resolved: null,
}

export function Maintenance() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  return (
    <SubPage
      title="Maintenance"
      action={
        <Link to="/maintenance/new" className="new-link">
          New <PlusIcon size={16} />
        </Link>
      }
    >
      <div className="section" style={{ marginTop: 6 }}>
        {state.maintenance.length === 0 && (
          <div className="card empty">
            <span className="empty-icon">
              <WrenchIcon />
            </span>
            No maintenance issues yet
          </div>
        )}
        {state.maintenance.map((m) => {
          const prop = state.properties.find((p) => p.id === m.propertyId)
          const next = nextStatus[m.status]
          return (
            <div key={m.id} className="list-item">
              <div className="list-item-head">
                <WrenchIcon size={18} />
                {m.title}
                <span className="spacer" />
                <Chip label={m.status} />
              </div>
              <div className="chips" style={{ marginTop: 8 }}>
                <Chip label={m.priority} />
              </div>
              <div className="list-item-body">{m.description}</div>
              {prop && <div className="list-item-sub">{prop.address}</div>}
              <div className="list-item-sub">Reported {formatDate(m.reportedAt)}</div>
              {next && (
                <button
                  className="btn btn-primary btn-small"
                  style={{ marginTop: 10 }}
                  onClick={() =>
                    dispatch({ type: 'setMaintenanceStatus', id: m.id, status: next })
                  }
                >
                  Mark {next}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </SubPage>
  )
}
