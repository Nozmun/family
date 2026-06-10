import { CheckIcon } from './icons'

const classFor: Record<string, string> = {
  'Let Agreed': 'chip-let-agreed',
  Let: 'chip-let',
  Available: 'chip-available',
  Listed: 'chip-listed',
  Unlisted: 'chip-unlisted',
  Pending: 'chip-pending',
  Accepted: 'chip-accepted',
  Declined: 'chip-declined',
  Signed: 'chip-signed',
  Draft: 'chip-draft',
  Sent: 'chip-sent',
  Expired: 'chip-expired',
  Open: 'chip-open',
  'In Progress': 'chip-in-progress',
  Resolved: 'chip-resolved',
  Upcoming: 'chip-upcoming',
  Completed: 'chip-completed',
  Cancelled: 'chip-cancelled',
  Low: 'chip-low',
  Medium: 'chip-medium',
  High: 'chip-high',
  Urgent: 'chip-urgent',
}

export function Chip({ label }: { label: string }) {
  return (
    <span className={`chip ${classFor[label] ?? 'chip-unlisted'}`}>
      {label === 'Let' && <CheckIcon size={12} />}
      {label}
    </span>
  )
}
