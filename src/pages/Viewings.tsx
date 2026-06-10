import { useState } from 'react'
import type { FormEvent } from 'react'
import { Chip } from '../components/Chip'
import { SubPage } from '../components/SubPage'
import { CalendarIcon, EyeIcon, PlusIcon } from '../components/icons'
import { uid, useAppDispatch, useAppState } from '../store'
import { formatDateTime } from '../utils'

export function Viewings() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [adding, setAdding] = useState(false)
  const [propertyId, setPropertyId] = useState(state.properties[0]?.id ?? '')
  const [applicantName, setApplicantName] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [error, setError] = useState('')

  const onAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!applicantName.trim()) {
      setError('Please enter the applicant name.')
      return
    }
    if (!dateTime) {
      setError('Please choose a date and time.')
      return
    }
    if (!propertyId) {
      setError('Please choose a property.')
      return
    }
    dispatch({
      type: 'addViewing',
      viewing: {
        id: uid(),
        propertyId,
        applicantName: applicantName.trim(),
        dateTime: new Date(dateTime).toISOString(),
        status: 'Upcoming',
      },
    })
    setApplicantName('')
    setDateTime('')
    setError('')
    setAdding(false)
  }

  return (
    <SubPage
      title="Viewings"
      action={
        <button className="new-link" onClick={() => setAdding((a) => !a)}>
          {adding ? 'Close' : 'New'} {!adding && <PlusIcon size={16} />}
        </button>
      }
    >
      {adding && (
        <form className="form" onSubmit={onAdd} style={{ paddingTop: 4 }}>
          <div className="field">
            <label htmlFor="v-property">Property</label>
            <select
              id="v-property"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              {state.properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="v-name">Applicant name</label>
            <input
              id="v-name"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="e.g. Sarah Khan"
            />
          </div>
          <div className="field">
            <label htmlFor="v-when">Date &amp; time</label>
            <input
              id="v-when"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
          {error && <div className="error-text" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary">
            Schedule Viewing
          </button>
        </form>
      )}

      <div className="section" style={{ marginTop: 6 }}>
        {state.viewings.length === 0 && (
          <div className="card empty">
            <span className="empty-icon">
              <EyeIcon />
            </span>
            No viewings scheduled yet
          </div>
        )}
        {state.viewings.map((v) => {
          const prop = state.properties.find((p) => p.id === v.propertyId)
          return (
            <div key={v.id} className="list-item">
              <div className="list-item-head">
                <CalendarIcon size={18} />
                {v.applicantName}
                <span className="spacer" />
                <Chip label={v.status} />
              </div>
              <div className="list-item-body">{formatDateTime(v.dateTime)}</div>
              {prop && <div className="list-item-sub">{prop.address}</div>}
              {v.notes && <div className="list-item-sub">{v.notes}</div>}
              {v.status === 'Upcoming' && (
                <div className="btn-row" style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() =>
                      dispatch({ type: 'setViewingStatus', id: v.id, status: 'Completed' })
                    }
                  >
                    Mark Completed
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() =>
                      dispatch({ type: 'setViewingStatus', id: v.id, status: 'Cancelled' })
                    }
                  >
                    Cancel
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
