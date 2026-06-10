export type LetStatus = 'Let' | 'Let Agreed' | 'Available' | 'None'
export type ListingStatus = 'Listed' | 'Unlisted'

export interface Property {
  id: string
  address: string
  rentPcm: number
  letStatus: LetStatus
  listingStatus: ListingStatus
  bedrooms: number
  bathrooms: number
  propertyType: 'Flat' | 'House' | 'Studio' | 'Room'
  createdAt: string
}

export type MaintenanceStatus = 'Open' | 'In Progress' | 'Resolved'
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface MaintenanceIssue {
  id: string
  propertyId: string
  title: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  reportedAt: string
}

export type CertificateType = 'GSC' | 'EICR' | 'EPC' | 'Other'

export interface Todo {
  id: string
  title: string
  detail: string
  propertyId?: string
  certificateType?: CertificateType
  dueDate?: string
  done: boolean
}

export type ViewingStatus = 'Upcoming' | 'Completed' | 'Cancelled'

export interface Viewing {
  id: string
  propertyId: string
  applicantName: string
  dateTime: string
  status: ViewingStatus
  notes?: string
}

export type ApplicationStatus = 'Pending' | 'Accepted' | 'Declined'

export interface Application {
  id: string
  propertyId: string
  applicantName: string
  offerPcm: number
  moveInDate: string
  status: ApplicationStatus
  submittedAt: string
}

export type AgreementStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired'

export interface Agreement {
  id: string
  propertyId: string
  tenantName: string
  rentPcm: number
  startDate: string
  endDate: string
  status: AgreementStatus
}

export interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  sentAt: string
}

export interface Conversation {
  id: string
  withName: string
  propertyId?: string
  messages: ChatMessage[]
  unread: number
}

export type NotificationKind = 'certificate' | 'application' | 'viewing' | 'maintenance' | 'message' | 'general'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: string
  read: boolean
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export interface AppState {
  userName: string
  properties: Property[]
  maintenance: MaintenanceIssue[]
  todos: Todo[]
  viewings: Viewing[]
  applications: Application[]
  agreements: Agreement[]
  conversations: Conversation[]
  notifications: AppNotification[]
  aiMessages: AiMessage[]
}
