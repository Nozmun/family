import { Link } from 'react-router-dom'
import type { Property } from '../types'
import { formatMoney, shortAddress } from '../utils'
import { Chip } from './Chip'
import { ImageIcon, PinIcon, TrashIcon } from './icons'

export function PropertyCard({
  property,
  onDelete,
  truncate,
}: {
  property: Property
  onDelete?: (id: string) => void
  truncate?: boolean
}) {
  return (
    <div className="card property-card">
      <div className="property-thumb">
        <ImageIcon />
      </div>
      <div className="property-body">
        <div className="chips">
          {property.letStatus !== 'None' && <Chip label={property.letStatus} />}
          <Chip label={property.listingStatus} />
        </div>
        <Link
          to={`/properties/${property.id}`}
          className="property-address"
          style={{ textDecoration: 'none' }}
        >
          <span className="pin">
            <PinIcon />
          </span>
          {truncate ? shortAddress(property.address) : property.address}
        </Link>
        <div className="property-price">{formatMoney(property.rentPcm)} (PCM)</div>
      </div>
      {onDelete && (
        <button
          className="delete-btn"
          aria-label={`Delete ${property.address}`}
          onClick={() => onDelete(property.id)}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  )
}
