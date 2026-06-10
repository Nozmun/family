import { Chip } from '../components/Chip'
import { SubPage } from '../components/SubPage'
import { HandshakeIcon } from '../components/icons'
import { useAppState } from '../store'
import { formatDate, formatMoney } from '../utils'

export function Agreements() {
  const state = useAppState()

  return (
    <SubPage title="Agreements">
      <div className="section" style={{ marginTop: 6 }}>
        {state.agreements.length === 0 && (
          <div className="card empty">
            <span className="empty-icon">
              <HandshakeIcon />
            </span>
            No tenancy agreements yet
          </div>
        )}
        {state.agreements.map((a) => {
          const prop = state.properties.find((p) => p.id === a.propertyId)
          return (
            <div key={a.id} className="list-item">
              <div className="list-item-head">
                <HandshakeIcon size={18} />
                {a.tenantName}
                <span className="spacer" />
                <Chip label={a.status} />
              </div>
              <div className="list-item-body">
                {formatMoney(a.rentPcm)} PCM · {formatDate(a.startDate)} –{' '}
                {formatDate(a.endDate)}
              </div>
              {prop && <div className="list-item-sub">{prop.address}</div>}
            </div>
          )
        })}
      </div>
    </SubPage>
  )
}
