import { Chip } from '../components/Chip'
import { SubPage } from '../components/SubPage'
import { BellIcon } from '../components/icons'
import { useAppDispatch, useAppState } from '../store'
import { formatDateTime } from '../utils'
import type { NotificationKind } from '../types'

const kindLabel: Record<NotificationKind, string> = {
  certificate: 'Certificate',
  application: 'Application',
  viewing: 'Viewing',
  maintenance: 'Maintenance',
  message: 'Message',
  general: 'General',
}

export function Notifications() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const unread = state.notifications.filter((n) => !n.read).length

  return (
    <SubPage
      title="Notifications"
      action={
        unread > 0 ? (
          <button
            className="new-link"
            onClick={() => dispatch({ type: 'markAllNotificationsRead' })}
          >
            Mark all read
          </button>
        ) : undefined
      }
    >
      <div className="section" style={{ marginTop: 6 }}>
        {state.notifications.length === 0 && (
          <div className="card empty">
            <span className="empty-icon">
              <BellIcon />
            </span>
            No notifications yet
          </div>
        )}
        {state.notifications.map((n) => (
          <button
            key={n.id}
            className={`list-item${n.read ? '' : ' notif-unread'}`}
            style={{
              width: '100%',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
            onClick={() => dispatch({ type: 'markNotificationRead', id: n.id })}
          >
            <div className="list-item-head">
              {n.title}
              <span className="spacer" />
              <Chip label={kindLabel[n.kind]} />
            </div>
            <div className="list-item-body">{n.body}</div>
            <div className="notif-time">{formatDateTime(n.createdAt)}</div>
          </button>
        ))}
      </div>
    </SubPage>
  )
}
