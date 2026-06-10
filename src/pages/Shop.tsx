import { SubPage } from '../components/SubPage'
import { formatMoney } from '../utils'

const products = [
  {
    id: 's1',
    emoji: '🔥',
    name: 'Gas Safety Certificate (GSC)',
    price: 75,
    desc: 'Annual gas safety inspection by a registered engineer.',
  },
  {
    id: 's2',
    emoji: '⚡',
    name: 'EICR Electrical Report',
    price: 149,
    desc: 'Electrical installation condition report, valid 5 years.',
  },
  {
    id: 's3',
    emoji: '🏠',
    name: 'EPC Assessment',
    price: 65,
    desc: 'Energy performance certificate, valid 10 years.',
  },
  {
    id: 's4',
    emoji: '📋',
    name: 'Inventory Report',
    price: 99,
    desc: 'Professional check-in inventory with photos.',
  },
  {
    id: 's5',
    emoji: '🛡️',
    name: 'Rent Guarantee Insurance',
    price: 199,
    desc: '12 months of rent protection and legal cover.',
  },
  {
    id: 's6',
    emoji: '🔍',
    name: 'Tenant Referencing',
    price: 25,
    desc: 'Full credit, employment and landlord reference checks.',
  },
  {
    id: 's7',
    emoji: '📸',
    name: 'Professional Photography',
    price: 89,
    desc: 'Listing-ready photos to let your property faster.',
  },
  {
    id: 's8',
    emoji: '📄',
    name: 'Tenancy Agreement Drafting',
    price: 49,
    desc: 'Solicitor-approved AST agreement, customised for you.',
  },
]

export function Shop() {
  return (
    <SubPage title="Shop">
      <p className="page-sub">Services and certificates for your properties.</p>
      <div className="shop-grid">
        {products.map((p) => (
          <div key={p.id} className="shop-item">
            <span className="shop-emoji" aria-hidden>
              {p.emoji}
            </span>
            <span className="shop-name">{p.name}</span>
            <span className="shop-desc">{p.desc}</span>
            <span className="shop-price">{formatMoney(p.price)}</span>
            <button className="btn btn-primary btn-small">Order</button>
          </div>
        ))}
      </div>
    </SubPage>
  )
}
