import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AppProvider, reducer } from '../store'
import { makeSeedState } from '../data/seed'
import { answerQuestion } from '../ai'
import { formatMoney } from '../utils'

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProvider initialState={makeSeedState()}>
        <App />
      </AppProvider>
    </MemoryRouter>,
  )
}

describe('Dashboard', () => {
  it('greets the user and shows the property carousel', () => {
    renderApp('/')
    expect(screen.getByText(/Hi, Nozmun & jeasmin/)).toBeInTheDocument()
    expect(screen.getAllByText(/Flat, Waylands Court/).length).toBeGreaterThan(0)
    expect(screen.getByText('£2,000.00 (PCM)')).toBeInTheDocument()
    expect(screen.getByText('Let Agreed')).toBeInTheDocument()
  })

  it('shows quick actions, maintenance and to-do sections', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /Viewings/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Applications/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Agreements/ })).toBeInTheDocument()
    expect(screen.getByText('No maintenance issues yet')).toBeInTheDocument()
    expect(screen.getByText('Certificate Reminder')).toBeInTheDocument()
    expect(
      screen.getByText(/Your certificate GSC is expiring in 1 month/),
    ).toBeInTheDocument()
  })

  it('shows unread notification badge in the bottom nav', () => {
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    const notifLink = within(nav).getByRole('link', { name: /Notifications/ })
    expect(within(notifLink).getByText('2')).toBeInTheDocument()
  })
})

describe('Properties', () => {
  it('lists all properties with statuses and prices', () => {
    renderApp('/properties')
    expect(screen.getByText('My Properties')).toBeInTheDocument()
    expect(screen.getByText('Showing 3 properties.')).toBeInTheDocument()
    expect(screen.getByText(/31 South Park Road/)).toBeInTheDocument()
    expect(screen.getByText(/74 Holmwood Road/)).toBeInTheDocument()
    expect(screen.getByText('£2,300.00 (PCM)')).toBeInTheDocument()
    expect(screen.getByText('£0.00 (PCM)')).toBeInTheDocument()
    expect(screen.getByText('Let')).toBeInTheDocument()
    expect(screen.getAllByText('Unlisted')).toHaveLength(3)
  })

  it('adds a new property via the form', async () => {
    const user = userEvent.setup()
    renderApp('/properties')
    await user.click(screen.getByRole('link', { name: /New/ }))
    await user.type(
      screen.getByLabelText('Address'),
      '12 High Street, Ilford, Essex, IG1 1AA',
    )
    await user.type(screen.getByLabelText(/Rent/), '1500')
    await user.click(screen.getByRole('button', { name: 'Add Property' }))
    expect(screen.getByText('Showing 4 properties.')).toBeInTheDocument()
    expect(screen.getByText(/12 High Street/)).toBeInTheDocument()
    expect(screen.getByText('£1,500.00 (PCM)')).toBeInTheDocument()
  })

  it('validates the property form', async () => {
    const user = userEvent.setup()
    renderApp('/properties/new')
    await user.click(screen.getByRole('button', { name: 'Add Property' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please enter the property address.',
    )
  })

  it('deletes a property after confirmation', async () => {
    const user = userEvent.setup()
    renderApp('/properties')
    await user.click(
      screen.getByRole('button', { name: /Delete 74 Holmwood Road/ }),
    )
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('Showing 2 properties.')).toBeInTheDocument()
    expect(screen.queryByText(/74 Holmwood Road/)).not.toBeInTheDocument()
  })

  it('cancels deletion', async () => {
    const user = userEvent.setup()
    renderApp('/properties')
    await user.click(
      screen.getByRole('button', { name: /Delete 74 Holmwood Road/ }),
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Showing 3 properties.')).toBeInTheDocument()
  })

  it('edits an existing property', async () => {
    const user = userEvent.setup()
    renderApp('/properties/p3')
    await user.click(screen.getByRole('button', { name: 'Edit Property' }))
    const rent = screen.getByLabelText(/Rent/)
    await user.clear(rent)
    await user.type(rent, '1800')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(screen.getByText('£1,800.00 (PCM)')).toBeInTheDocument()
  })
})

describe('Maintenance', () => {
  it('reports a new issue and progresses its status', async () => {
    const user = userEvent.setup()
    renderApp('/maintenance')
    expect(screen.getByText('No maintenance issues yet')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /New/ }))
    await user.type(screen.getByLabelText('Issue title'), 'Boiler not heating')
    await user.type(screen.getByLabelText('Description'), 'No hot water since Monday')
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    await user.click(screen.getByRole('button', { name: 'Report Issue' }))

    expect(screen.getByText('Boiler not heating')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mark In Progress' }))
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mark Resolved' }))
    expect(screen.getByText('Resolved')).toBeInTheDocument()
  })
})

describe('To-Do', () => {
  it('shows the seeded certificate reminder and completes it', async () => {
    const user = userEvent.setup()
    renderApp('/todos')
    expect(screen.getByText('Certificate Reminder')).toBeInTheDocument()
    expect(screen.getByText('GSC')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('adds a new task', async () => {
    const user = userEvent.setup()
    renderApp('/todos')
    await user.click(screen.getByRole('button', { name: /New/ }))
    await user.type(screen.getByLabelText('Title'), 'Renew EICR certificate')
    await user.click(screen.getByRole('button', { name: 'Add Task' }))
    expect(screen.getByText('Renew EICR certificate')).toBeInTheDocument()
  })
})

describe('Viewings', () => {
  it('schedules a viewing and completes it', async () => {
    const user = userEvent.setup()
    renderApp('/viewings')
    expect(screen.getByText('Sarah Khan')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /New/ }))
    await user.type(screen.getByLabelText('Applicant name'), 'Tom Hale')
    await user.type(screen.getByLabelText(/Date & time/), '2026-07-01T14:30')
    await user.click(screen.getByRole('button', { name: 'Schedule Viewing' }))
    expect(screen.getByText('Tom Hale')).toBeInTheDocument()

    const completeButtons = screen.getAllByRole('button', { name: 'Mark Completed' })
    await user.click(completeButtons[0])
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})

describe('Applications', () => {
  it('accepts a pending application', async () => {
    const user = userEvent.setup()
    renderApp('/applications')
    expect(screen.getByText('James Carter')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Accept' }))
    expect(screen.getByText('Accepted')).toBeInTheDocument()
  })
})

describe('Agreements', () => {
  it('lists agreements with status', () => {
    renderApp('/agreements')
    expect(screen.getByText('Amelia Brown')).toBeInTheDocument()
    expect(screen.getByText('Signed')).toBeInTheDocument()
  })
})

describe('Messages', () => {
  it('opens a conversation, clears unread and sends a message', async () => {
    const user = userEvent.setup()
    renderApp('/messages')
    expect(screen.getAllByText('Amelia Brown').length).toBeGreaterThan(0)
    await user.click(screen.getByText(/boiler service is booked/))
    await user.type(screen.getByLabelText('Message'), 'Yes, confirmed for Friday 10am')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(screen.getByText('Yes, confirmed for Friday 10am')).toBeInTheDocument()
  })
})

describe('Notifications', () => {
  it('lists notifications and marks all read', async () => {
    const user = userEvent.setup()
    renderApp('/notifications')
    expect(screen.getByText('Certificate expiring soon')).toBeInTheDocument()
    expect(screen.getByText('New application received')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mark all read' }))
    expect(
      screen.queryByRole('button', { name: 'Mark all read' }),
    ).not.toBeInTheDocument()
  })
})

describe('Rentr AI', () => {
  it('answers a typed question about rental income', async () => {
    const user = userEvent.setup()
    renderApp('/ai')
    await user.type(screen.getByLabelText('Ask Rentr AI'), 'What is my rental income?')
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    expect(screen.getByText(/£4,300.00 per month/)).toBeInTheDocument()
  })

  it('answers via suggestion chips', async () => {
    const user = userEvent.setup()
    renderApp('/ai')
    await user.click(screen.getByRole('button', { name: 'Any certificates expiring?' }))
    expect(screen.getByText(/certificate reminder/i)).toBeInTheDocument()
  })
})

describe('Shop', () => {
  it('shows products with prices', () => {
    renderApp('/shop')
    expect(screen.getByText('Gas Safety Certificate (GSC)')).toBeInTheDocument()
    expect(screen.getByText('£75.00')).toBeInTheDocument()
  })
})

describe('reducer', () => {
  it('deleting a property removes its related records', () => {
    const state = makeSeedState()
    const next = reducer(state, { type: 'deleteProperty', id: 'p2' })
    expect(next.properties.find((p) => p.id === 'p2')).toBeUndefined()
    expect(next.agreements.some((a) => a.propertyId === 'p2')).toBe(false)
  })

  it('marks all notifications read', () => {
    const state = makeSeedState()
    const next = reducer(state, { type: 'markAllNotificationsRead' })
    expect(next.notifications.every((n) => n.read)).toBe(true)
  })
})

describe('AI engine', () => {
  it('sums only let and let-agreed rent', () => {
    const state = makeSeedState()
    const answer = answerQuestion(state, 'total rent?')
    expect(answer).toContain(formatMoney(4300))
  })

  it('reports no maintenance issues when none exist', () => {
    const state = makeSeedState()
    expect(answerQuestion(state, 'any maintenance issues?')).toMatch(
      /no open maintenance issues/i,
    )
  })

  it('lists upcoming viewings', () => {
    const state = makeSeedState()
    expect(answerQuestion(state, 'do I have viewings?')).toContain('Sarah Khan')
  })
})
