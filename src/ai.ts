import type { AppState } from './types'
import { daysUntil, formatDate, formatMoney } from './utils'

/**
 * Rentr AI: a local assistant that answers questions about the
 * landlord's own portfolio data. Runs entirely on-device.
 */
export function answerQuestion(state: AppState, question: string): string {
  const q = question.toLowerCase()

  const totalRent = state.properties
    .filter((p) => p.letStatus === 'Let' || p.letStatus === 'Let Agreed')
    .reduce((sum, p) => sum + p.rentPcm, 0)

  if (/(rent|income|earn|revenue)/.test(q)) {
    const lines = state.properties.map(
      (p) => `• ${p.address}: ${formatMoney(p.rentPcm)} PCM (${p.letStatus === 'None' ? 'not let' : p.letStatus})`,
    )
    return `Your expected rental income from let or let-agreed properties is ${formatMoney(totalRent)} per month.\n\n${lines.join('\n')}`
  }

  if (/(certificate|gsc|eicr|epc|gas|electric|expir)/.test(q)) {
    const certs = state.todos.filter((t) => t.certificateType && !t.done)
    if (certs.length === 0) return 'You have no outstanding certificate reminders. Nice work staying compliant!'
    const lines = certs.map((t) => {
      const prop = state.properties.find((p) => p.id === t.propertyId)
      const due = t.dueDate ? ` — due ${formatDate(t.dueDate)} (${daysUntil(t.dueDate)} days)` : ''
      return `• ${t.certificateType}${prop ? ` for ${prop.address}` : ''}${due}`
    })
    return `You have ${certs.length} certificate reminder${certs.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}`
  }

  if (/(maintenance|repair|issue|broken|fix)/.test(q)) {
    const open = state.maintenance.filter((m) => m.status !== 'Resolved')
    if (open.length === 0) return 'There are no open maintenance issues across your portfolio right now.'
    const lines = open.map((m) => {
      const prop = state.properties.find((p) => p.id === m.propertyId)
      return `• ${m.title} (${m.priority}, ${m.status})${prop ? ` — ${prop.address}` : ''}`
    })
    return `You have ${open.length} open maintenance issue${open.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}`
  }

  if (/(viewing|visit)/.test(q)) {
    const upcoming = state.viewings.filter((v) => v.status === 'Upcoming')
    if (upcoming.length === 0) return 'You have no upcoming viewings scheduled.'
    const lines = upcoming.map((v) => {
      const prop = state.properties.find((p) => p.id === v.propertyId)
      return `• ${v.applicantName} on ${formatDate(v.dateTime)}${prop ? ` — ${prop.address}` : ''}`
    })
    return `You have ${upcoming.length} upcoming viewing${upcoming.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}`
  }

  if (/(application|applicant|offer)/.test(q)) {
    const pending = state.applications.filter((a) => a.status === 'Pending')
    if (pending.length === 0) return 'You have no pending applications at the moment.'
    const lines = pending.map((a) => {
      const prop = state.properties.find((p) => p.id === a.propertyId)
      return `• ${a.applicantName} offered ${formatMoney(a.offerPcm)} PCM${prop ? ` for ${prop.address}` : ''}`
    })
    return `You have ${pending.length} pending application${pending.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}`
  }

  if (/(propert|portfolio|how many|house|flat)/.test(q)) {
    const lines = state.properties.map(
      (p) =>
        `• ${p.address} — ${p.letStatus === 'None' ? 'Not let' : p.letStatus}, ${p.listingStatus}, ${formatMoney(p.rentPcm)} PCM`,
    )
    return `You have ${state.properties.length} propert${state.properties.length === 1 ? 'y' : 'ies'}:\n\n${lines.join('\n')}`
  }

  if (/(agreement|tenancy|contract|lease)/.test(q)) {
    if (state.agreements.length === 0) return 'You have no tenancy agreements yet.'
    const lines = state.agreements.map((a) => {
      const prop = state.properties.find((p) => p.id === a.propertyId)
      return `• ${a.tenantName} (${a.status}) — ${formatMoney(a.rentPcm)} PCM, ${formatDate(a.startDate)} to ${formatDate(a.endDate)}${prop ? ` at ${prop.address}` : ''}`
    })
    return `You have ${state.agreements.length} agreement${state.agreements.length > 1 ? 's' : ''}:\n\n${lines.join('\n')}`
  }

  if (/(hello|hi|hey)/.test(q)) {
    return `Hello! I can help with your portfolio. Try asking: "What is my rental income?", "Any certificates expiring?", "Do I have any viewings?" or "Show my properties".`
  }

  return `I can answer questions about your properties, rent income, certificates, maintenance, viewings, applications and agreements. Try asking: "What is my total rent?" or "Any certificates expiring soon?"`
}
