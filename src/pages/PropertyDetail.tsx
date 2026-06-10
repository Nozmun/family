import { Link, useNavigate, useParams } from 'react-router-dom'
import { Chip } from '../components/Chip'
import { SubPage } from '../components/SubPage'
import { ImageIcon, PinIcon } from '../components/icons'
import { useAppState } from '../store'
import { formatMoney } from '../utils'

export function PropertyDetail() {
  const { id } = useParams()
  const state = useAppState()
  const navigate = useNavigate()
  const property = state.properties.find((p) => p.id === id)

  if (!property) {
    return (
      <SubPage title="Property not found">
        <div className="section">
          <div className="card empty">This property no longer exists.</div>
        </div>
      </SubPage>
    )
  }

  const issues = state.maintenance.filter((m) => m.propertyId === property.id)
  const viewings = state.viewings.filter((v) => v.propertyId === property.id)
  const applications = state.applications.filter((a) => a.propertyId === property.id)
  const agreements = state.agreements.filter((a) => a.propertyId === property.id)

  return (
    <SubPage title="Property Details">
      <div className="section" style={{ marginTop: 6 }}>
        <div className="card">
          <div
            className="property-thumb"
            style={{ width: '100%', height: 140, marginBottom: 12 }}
          >
            <ImageIcon size={44} />
          </div>
          <div className="chips">
            {property.letStatus !== 'None' && <Chip label={property.letStatus} />}
            <Chip label={property.listingStatus} />
          </div>
          <div className="property-address">
            <span className="pin">
              <PinIcon />
            </span>
            {property.address}
          </div>
          <div className="property-price" style={{ fontSize: 20 }}>
            {formatMoney(property.rentPcm)} (PCM)
          </div>
          <div className="detail-grid">
            <div className="detail-cell">
              <div className="k">Type</div>
              <div className="v">{property.propertyType}</div>
            </div>
            <div className="detail-cell">
              <div className="k">Bedrooms</div>
              <div className="v">{property.bedrooms}</div>
            </div>
            <div className="detail-cell">
              <div className="k">Bathrooms</div>
              <div className="v">{property.bathrooms}</div>
            </div>
            <div className="detail-cell">
              <div className="k">Status</div>
              <div className="v">
                {property.letStatus === 'None' ? 'Not let' : property.letStatus}
              </div>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <button
              className="btn btn-primary btn-small"
              onClick={() => navigate(`/properties/${property.id}/edit`)}
            >
              Edit Property
            </button>
            <Link
              to={`/maintenance/new?propertyId=${property.id}`}
              className="btn btn-secondary btn-small"
              style={{ textAlign: 'center', textDecoration: 'none' }}
            >
              Report Issue
            </Link>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Activity</h2>
        </div>
        <div className="card">
          <div className="detail-grid" style={{ marginTop: 0 }}>
            <div className="detail-cell">
              <div className="k">Viewings</div>
              <div className="v">{viewings.length}</div>
            </div>
            <div className="detail-cell">
              <div className="k">Applications</div>
              <div className="v">{applications.length}</div>
            </div>
            <div className="detail-cell">
              <div className="k">Agreements</div>
              <div className="v">{agreements.length}</div>
            </div>
            <div className="detail-cell">
              <div className="k">Open issues</div>
              <div className="v">{issues.filter((i) => i.status !== 'Resolved').length}</div>
            </div>
          </div>
        </div>
      </div>
    </SubPage>
  )
}
