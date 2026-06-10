import { createContext, useContext, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import type {
  AppNotification,
  AppState,
  Agreement,
  AiMessage,
  Application,
  ApplicationStatus,
  ChatMessage,
  MaintenanceIssue,
  MaintenanceStatus,
  Property,
  Todo,
  Viewing,
  ViewingStatus,
} from './types'
import { makeSeedState } from './data/seed'

const STORAGE_KEY = 'rentr-state-v1'

export type Action =
  | { type: 'addProperty'; property: Property }
  | { type: 'updateProperty'; property: Property }
  | { type: 'deleteProperty'; id: string }
  | { type: 'addMaintenance'; issue: MaintenanceIssue }
  | { type: 'setMaintenanceStatus'; id: string; status: MaintenanceStatus }
  | { type: 'addTodo'; todo: Todo }
  | { type: 'toggleTodo'; id: string }
  | { type: 'deleteTodo'; id: string }
  | { type: 'addViewing'; viewing: Viewing }
  | { type: 'setViewingStatus'; id: string; status: ViewingStatus }
  | { type: 'addApplication'; application: Application }
  | { type: 'setApplicationStatus'; id: string; status: ApplicationStatus }
  | { type: 'addAgreement'; agreement: Agreement }
  | { type: 'sendMessage'; conversationId: string; message: ChatMessage }
  | { type: 'markConversationRead'; id: string }
  | { type: 'addNotification'; notification: AppNotification }
  | { type: 'markNotificationRead'; id: string }
  | { type: 'markAllNotificationsRead' }
  | { type: 'addAiMessages'; messages: AiMessage[] }
  | { type: 'reset' }

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'addProperty':
      return { ...state, properties: [action.property, ...state.properties] }
    case 'updateProperty':
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === action.property.id ? action.property : p,
        ),
      }
    case 'deleteProperty':
      return {
        ...state,
        properties: state.properties.filter((p) => p.id !== action.id),
        maintenance: state.maintenance.filter((m) => m.propertyId !== action.id),
        viewings: state.viewings.filter((v) => v.propertyId !== action.id),
        applications: state.applications.filter((a) => a.propertyId !== action.id),
        agreements: state.agreements.filter((a) => a.propertyId !== action.id),
        todos: state.todos.filter((t) => t.propertyId !== action.id),
      }
    case 'addMaintenance':
      return { ...state, maintenance: [action.issue, ...state.maintenance] }
    case 'setMaintenanceStatus':
      return {
        ...state,
        maintenance: state.maintenance.map((m) =>
          m.id === action.id ? { ...m, status: action.status } : m,
        ),
      }
    case 'addTodo':
      return { ...state, todos: [action.todo, ...state.todos] }
    case 'toggleTodo':
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      }
    case 'deleteTodo':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) }
    case 'addViewing':
      return { ...state, viewings: [action.viewing, ...state.viewings] }
    case 'setViewingStatus':
      return {
        ...state,
        viewings: state.viewings.map((v) =>
          v.id === action.id ? { ...v, status: action.status } : v,
        ),
      }
    case 'addApplication':
      return { ...state, applications: [action.application, ...state.applications] }
    case 'setApplicationStatus':
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === action.id ? { ...a, status: action.status } : a,
        ),
      }
    case 'addAgreement':
      return { ...state, agreements: [action.agreement, ...state.agreements] }
    case 'sendMessage':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: [...c.messages, action.message] }
            : c,
        ),
      }
    case 'markConversationRead':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, unread: 0 } : c,
        ),
      }
    case 'addNotification':
      return { ...state, notifications: [action.notification, ...state.notifications] }
    case 'markNotificationRead':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      }
    case 'markAllNotificationsRead':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }
    case 'addAiMessages':
      return { ...state, aiMessages: [...state.aiMessages, ...action.messages] }
    case 'reset':
      return makeSeedState()
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>
      // Merge over the seed so newly added fields get sensible defaults.
      return { ...makeSeedState(), ...parsed }
    }
  } catch {
    // Corrupt storage: fall back to seed data.
  }
  return makeSeedState()
}

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<((action: Action) => void) | null>(null)

export function AppProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: AppState
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState ?? loadState())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage may be unavailable (private mode); the app still works in-memory.
    }
  }, [state])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useAppState(): AppState {
  const state = useContext(StateContext)
  if (!state) throw new Error('useAppState must be used within AppProvider')
  return state
}

export function useAppDispatch(): (action: Action) => void {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useAppDispatch must be used within AppProvider')
  return dispatch
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
