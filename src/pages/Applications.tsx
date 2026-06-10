import { Chip } from '../components/Chip'
import { SubPage } from '../components/SubPage'
import { FileIcon } from '../components/icons'
import { uid, useAppDispatch, useAppState } from '../store'
import { formatDate, formatMoney } from '../utils'

export function Applications() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  return (
    <SubPage title="Applications">
      <div className="section" style={{ marginTop: 6 }}>
        {state.applications.length === 0 && (
          <div className="card empty">
            <span className="empty-icon">
              <FileIcon />
            </span>
            No applications yet
          </div>
        )}
        {state.applications.map((a) => {
          const prop = state.properties.find((p) => p.id === a.propertyId)
          return (
            <div key={a.id} className="list-item">
              <div className="list-item-head">
                <FileIcon size={18} />
                {a.applicantName}
                <span className="spacer" />
                <Chip label={a.status} />
              </div>
              <div className="list-item-body">
                Offer: {formatMoney(a.offerPcm)} PCM · Move-in {formatDate(a.moveInDate)}
              </div>
              {prop && <div className="list-item-sub">{prop.address}</div>}
              <div className="list-item-sub">Submitted {formatDate(a.submittedAt)}</div>
              {a.status === 'Pending' && (
                <div className="btn-row" style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => {
                      dispatch({ type: 'setApplicationStatus', id: a.id, status: 'Accepted' })
                      dispatch({
                        type: 'addNotification',
                        notification: {
                          id: uid(),
                          kind: 'application',
                          title: 'Application accepted',
                          body: `You accepted ${a.applicantName}'s application.`,
                          createdAt: new Date().toISOString(),
                          read: false,
                        },
                      })
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() =>
                      dispatch({ type: 'setApplicationStatus', id: a.id, status: 'Declined' })
                    }
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SubPage>
  )
}
