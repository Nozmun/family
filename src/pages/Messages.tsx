import { Link } from 'react-router-dom'
import { SubPage } from '../components/SubPage'
import { ChatIcon } from '../components/icons'
import { useAppState } from '../store'

export function Messages() {
  const state = useAppState()

  return (
    <SubPage title="Messages">
      <div className="section" style={{ marginTop: 6 }}>
        {state.conversations.length === 0 && (
          <div className="card empty">
            <span className="empty-icon">
              <ChatIcon />
            </span>
            No conversations yet
          </div>
        )}
        {state.conversations.map((c) => {
          const last = c.messages[c.messages.length - 1]
          const prop = state.properties.find((p) => p.id === c.propertyId)
          return (
            <Link
              key={c.id}
              to={`/messages/${c.id}`}
              className="list-item conv-row"
              style={{ display: 'flex' }}
            >
              <div className="avatar">{c.withName.charAt(0)}</div>
              <div className="conv-main">
                <div className="conv-name">{c.withName}</div>
                {last && <div className="conv-preview">{last.text}</div>}
                {prop && <div className="conv-preview">{prop.address}</div>}
              </div>
              {c.unread > 0 && <span className="unread-dot">{c.unread}</span>}
            </Link>
          )
        })}
      </div>
    </SubPage>
  )
}
