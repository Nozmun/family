import type { AppState } from '../types'

export function makeSeedState(): AppState {
  const now = new Date()
  const iso = (d: Date) => d.toISOString()
  const daysFromNow = (n: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + n)
    return d
  }

  return {
    userName: 'Nozmun & jeasmin',
    properties: [
      {
        id: 'p1',
        address: 'Flat, Waylands Court, 8 Staines Road Ilford, Essex, IG1 2XF',
        rentPcm: 2000,
        letStatus: 'Let Agreed',
        listingStatus: 'Unlisted',
        bedrooms: 2,
        bathrooms: 1,
        propertyType: 'Flat',
        createdAt: iso(daysFromNow(-220)),
      },
      {
        id: 'p2',
        address: '31 South Park Road Ilford, Essex, IG1 2XW',
        rentPcm: 2300,
        letStatus: 'Let',
        listingStatus: 'Unlisted',
        bedrooms: 3,
        bathrooms: 2,
        propertyType: 'House',
        createdAt: iso(daysFromNow(-400)),
      },
      {
        id: 'p3',
        address: '74 Holmwood Road Ilford, Essex, IG3 9XZ',
        rentPcm: 0,
        letStatus: 'None',
        listingStatus: 'Unlisted',
        bedrooms: 3,
        bathrooms: 1,
        propertyType: 'House',
        createdAt: iso(daysFromNow(-30)),
      },
    ],
    maintenance: [],
    todos: [
      {
        id: 't1',
        title: 'Certificate Reminder',
        detail: 'Reminder: Your certificate GSC is expiring in 1 month.',
        propertyId: 'p1',
        certificateType: 'GSC',
        dueDate: iso(daysFromNow(30)),
        done: false,
      },
    ],
    viewings: [
      {
        id: 'v1',
        propertyId: 'p3',
        applicantName: 'Sarah Khan',
        dateTime: iso(daysFromNow(3)),
        status: 'Upcoming',
        notes: 'First-time renter, asked about parking.',
      },
    ],
    applications: [
      {
        id: 'a1',
        propertyId: 'p1',
        applicantName: 'James Carter',
        offerPcm: 2000,
        moveInDate: iso(daysFromNow(21)),
        status: 'Pending',
        submittedAt: iso(daysFromNow(-2)),
      },
    ],
    agreements: [
      {
        id: 'ag1',
        propertyId: 'p2',
        tenantName: 'Amelia Brown',
        rentPcm: 2300,
        startDate: iso(daysFromNow(-180)),
        endDate: iso(daysFromNow(185)),
        status: 'Signed',
      },
    ],
    conversations: [
      {
        id: 'c1',
        withName: 'Amelia Brown',
        propertyId: 'p2',
        unread: 1,
        messages: [
          {
            id: 'm1',
            from: 'them',
            text: 'Hi, just confirming the boiler service is booked for Friday?',
            sentAt: iso(daysFromNow(-1)),
          },
        ],
      },
      {
        id: 'c2',
        withName: 'James Carter',
        propertyId: 'p1',
        unread: 0,
        messages: [
          {
            id: 'm2',
            from: 'them',
            text: 'Thanks for showing me the flat, I have submitted my application.',
            sentAt: iso(daysFromNow(-2)),
          },
          {
            id: 'm3',
            from: 'me',
            text: 'Great, we will review it and get back to you shortly.',
            sentAt: iso(daysFromNow(-2)),
          },
        ],
      },
    ],
    notifications: [
      {
        id: 'n1',
        kind: 'certificate',
        title: 'Certificate expiring soon',
        body: 'Your GSC certificate for Flat, Waylands Court is expiring in 1 month.',
        createdAt: iso(daysFromNow(-1)),
        read: false,
      },
      {
        id: 'n2',
        kind: 'application',
        title: 'New application received',
        body: 'James Carter applied for Flat, Waylands Court at £2,000.00 PCM.',
        createdAt: iso(daysFromNow(-2)),
        read: false,
      },
    ],
    aiMessages: [
      {
        id: 'ai1',
        role: 'assistant',
        text: "Hi! I'm Rentr AI. Ask me anything about your portfolio — rent income, certificates, maintenance, viewings or applications.",
      },
    ],
  }
}
