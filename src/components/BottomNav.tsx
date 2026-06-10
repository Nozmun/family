import { NavLink } from 'react-router-dom'
import { useAppState } from '../store'
import { BellIcon, BoltIcon, ChatIcon, GridIcon, HomeIcon } from './icons'

export function BottomNav() {
  const state = useAppState()
  const unreadNotifs = state.notifications.filter((n) => !n.read).length
  const unreadMessages = state.conversations.reduce((sum, c) => sum + c.unread, 0)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item${isActive ? ' active' : ''}`

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavLink to="/" end className={linkClass}>
        <span className="nav-icon">
          <GridIcon />
        </span>
        Dashboard
      </NavLink>
      <NavLink to="/properties" className={linkClass}>
        <span className="nav-icon">
          <HomeIcon />
        </span>
        Property
      </NavLink>
      <NavLink to="/ai" className={linkClass}>
        <span className="nav-icon">
          <BoltIcon />
        </span>
        Rentr AI
      </NavLink>
      <NavLink to="/messages" className={linkClass}>
        <span className="nav-icon">
          <ChatIcon />
        </span>
        {unreadMessages > 0 && <span className="nav-badge">{unreadMessages}</span>}
        Messages
      </NavLink>
      <NavLink to="/notifications" className={linkClass}>
        <span className="nav-icon">
          <BellIcon />
        </span>
        {unreadNotifs > 0 && <span className="nav-badge">{unreadNotifs}</span>}
        Notifications
      </NavLink>
    </nav>
  )
}
