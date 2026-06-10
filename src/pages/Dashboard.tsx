import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PropertyCard } from '../components/PropertyCard'
import {
  BagIcon,
  CartIcon,
  ChevronRightIcon,
  EyeIcon,
  FileIcon,
  HandshakeIcon,
  MenuIcon,
  ShieldIcon,
  WrenchIcon,
} from '../components/icons'
import { useAppState } from '../store'

export function Dashboard() {
  const state = useAppState()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeDot, setActiveDot] = useState(0)

  const openIssues = state.maintenance.filter((m) => m.status !== 'Resolved')
  const pendingTodos = state.todos.filter((t) => !t.done)

  const onScroll = () => {
    const el = carouselRef.current
    if (!el || el.clientWidth === 0) return
    setActiveDot(Math.round(el.scrollLeft / el.clientWidth))
  }

  const scrollToDot = (i: number) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <h1>Hi, {state.userName}</h1>
          <div className="header-icons">
            <Link to="/shop" className="icon-btn" aria-label="Shop">
              <CartIcon />
            </Link>
            <button className="icon-btn" aria-label="Menu">
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>
      <div className="header-curve" />

      {state.properties.length > 0 ? (
        <>
          <div className="carousel" ref={carouselRef} onScroll={onScroll}>
            {state.properties.map((p) => (
              <PropertyCard key={p.id} property={p} truncate />
            ))}
          </div>
          <div className="carousel-dots">
            {state.properties.map((p, i) => (
              <button
                key={p.id}
                className={`dot${i === activeDot ? ' active' : ''}`}
                aria-label={`Go to property ${i + 1}`}
                onClick={() => scrollToDot(i)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="section">
          <div className="card empty">
            No properties yet. <Link to="/properties/new">Add your first property</Link>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <Link to="/viewings" className="quick-action">
          <span className="qa-icon">
            <EyeIcon />
          </span>
          <span className="qa-label">Viewings</span>
        </Link>
        <Link to="/applications" className="quick-action">
          <span className="qa-icon">
            <FileIcon />
          </span>
          <span className="qa-label">Applications</span>
        </Link>
        <Link to="/agreements" className="quick-action">
          <span className="qa-icon">
            <HandshakeIcon />
          </span>
          <span className="qa-label">Agreements</span>
        </Link>
        <Link to="/shop" className="quick-action">
          <span className="qa-icon">
            <BagIcon />
          </span>
          <span className="qa-label">Shop</span>
        </Link>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Maintenance</h2>
          <Link to="/maintenance" className="view-all">
            View All <ChevronRightIcon size={12} />
          </Link>
        </div>
        {openIssues.length === 0 ? (
          <div className="card empty">
            <span className="empty-icon">
              <WrenchIcon />
            </span>
            No maintenance issues yet
          </div>
        ) : (
          openIssues.slice(0, 2).map((m) => {
            const prop = state.properties.find((p) => p.id === m.propertyId)
            return (
              <div key={m.id} className="list-item">
                <div className="list-item-head">
                  <WrenchIcon size={18} />
                  {m.title}
                </div>
                <div className="list-item-body">
                  {m.priority} priority · {m.status}
                </div>
                {prop && <div className="list-item-sub">{prop.address}</div>}
              </div>
            )
          })
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>To-Do</h2>
          <Link to="/todos" className="view-all">
            View All <ChevronRightIcon size={12} />
          </Link>
        </div>
        {pendingTodos.length === 0 ? (
          <div className="card empty">
            <span className="empty-icon">
              <ShieldIcon />
            </span>
            Nothing to do — you're all caught up
          </div>
        ) : (
          pendingTodos.slice(0, 2).map((t) => {
            const prop = state.properties.find((p) => p.id === t.propertyId)
            return (
              <div key={t.id} className="list-item">
                <div className="list-item-head">
                  <ShieldIcon size={18} />
                  {t.title}
                </div>
                <div className="list-item-body">{t.detail}</div>
                {prop && <div className="list-item-sub">{prop.address}</div>}
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}
