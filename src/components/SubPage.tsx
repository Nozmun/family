import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'

export function SubPage({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="page-title-row">
        <h1>
          <button className="back-btn" aria-label="Back" onClick={() => navigate(-1)}>
            <ChevronLeftIcon />
          </button>
          {title}
        </h1>
        {action}
      </div>
      {children}
    </div>
  )
}
