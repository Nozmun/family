import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SubPage } from '../components/SubPage'
import { uid, useAppDispatch, useAppState } from '../store'
import type { LetStatus, ListingStatus, Property } from '../types'

export function PropertyForm() {
  const { id } = useParams()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const existing = id ? state.properties.find((p) => p.id === id) : undefined
  const editing = Boolean(id)

  const [address, setAddress] = useState(existing?.address ?? '')
  const [rent, setRent] = useState(existing ? String(existing.rentPcm) : '')
  const [letStatus, setLetStatus] = useState<LetStatus>(existing?.letStatus ?? 'None')
  const [listingStatus, setListingStatus] = useState<ListingStatus>(
    existing?.listingStatus ?? 'Unlisted',
  )
  const [bedrooms, setBedrooms] = useState(existing ? String(existing.bedrooms) : '1')
  const [bathrooms, setBathrooms] = useState(existing ? String(existing.bathrooms) : '1')
  const [propertyType, setPropertyType] = useState<Property['propertyType']>(
    existing?.propertyType ?? 'Flat',
  )
  const [error, setError] = useState('')

  if (editing && !existing) {
    return (
      <SubPage title="Property not found">
        <div className="section">
          <div className="card empty">This property no longer exists.</div>
        </div>
      </SubPage>
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!address.trim()) {
      setError('Please enter the property address.')
      return
    }
    const rentNum = Number(rent || 0)
    if (Number.isNaN(rentNum) || rentNum < 0) {
      setError('Rent must be a positive number.')
      return
    }
    const property: Property = {
      id: existing?.id ?? uid(),
      address: address.trim(),
      rentPcm: rentNum,
      letStatus,
      listingStatus,
      bedrooms: Math.max(0, Number(bedrooms) || 0),
      bathrooms: Math.max(0, Number(bathrooms) || 0),
      propertyType,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }
    dispatch({ type: editing ? 'updateProperty' : 'addProperty', property })
    navigate(editing ? `/properties/${property.id}` : '/properties')
  }

  return (
    <SubPage title={editing ? 'Edit Property' : 'New Property'}>
      <form className="form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="address">Address</label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 12 High Street, Ilford, Essex, IG1 1AA"
          />
        </div>
        <div className="field">
          <label htmlFor="rent">Rent (PCM, £)</label>
          <input
            id="rent"
            type="number"
            min="0"
            step="50"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            placeholder="e.g. 2000"
          />
        </div>
        <div className="field">
          <label htmlFor="type">Property type</label>
          <select
            id="type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as Property['propertyType'])}
          >
            <option>Flat</option>
            <option>House</option>
            <option>Studio</option>
            <option>Room</option>
          </select>
        </div>
        <div className="btn-row">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="bedrooms">Bedrooms</label>
            <input
              id="bedrooms"
              type="number"
              min="0"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="bathrooms">Bathrooms</label>
            <input
              id="bathrooms"
              type="number"
              min="0"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="letStatus">Let status</label>
          <select
            id="letStatus"
            value={letStatus}
            onChange={(e) => setLetStatus(e.target.value as LetStatus)}
          >
            <option value="None">Not let</option>
            <option value="Available">Available</option>
            <option value="Let Agreed">Let Agreed</option>
            <option value="Let">Let</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="listingStatus">Listing status</label>
          <select
            id="listingStatus"
            value={listingStatus}
            onChange={(e) => setListingStatus(e.target.value as ListingStatus)}
          >
            <option>Unlisted</option>
            <option>Listed</option>
          </select>
        </div>
        {error && <div className="error-text" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary">
          {editing ? 'Save Changes' : 'Add Property'}
        </button>
      </form>
    </SubPage>
  )
}
