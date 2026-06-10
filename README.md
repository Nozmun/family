# Rentr — Property Management App

A mobile-first property management app for landlords, built with React,
TypeScript and Vite. State is stored locally in the browser (localStorage),
so it works fully offline with no backend required.

## Features

- **Dashboard** — greeting, swipeable property carousel with status chips,
  quick actions, maintenance overview and to-do reminders.
- **My Properties** — list, add, edit and delete properties with let status
  (Let / Let Agreed / Available), listing status and rent (PCM).
- **Maintenance** — report issues per property with priority, and move them
  through Open → In Progress → Resolved.
- **To-Do** — tasks and certificate reminders (GSC, EICR, EPC) with due
  dates and overdue tracking.
- **Viewings** — schedule, complete or cancel property viewings.
- **Applications** — review tenant applications and accept or decline them.
- **Agreements** — tenancy agreements with status and term dates.
- **Shop** — landlord services (certificates, referencing, photography…).
- **Rentr AI** — a built-in assistant that answers questions about your own
  portfolio (rent income, expiring certificates, open issues, viewings…).
- **Messages** — conversations with tenants and applicants, with unread badges.
- **Notifications** — activity feed with unread count in the bottom nav.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the test suite (Vitest + Testing Library)
npm run build    # type-check and build for production
```

Open the printed URL on a phone-sized viewport for the intended experience.
