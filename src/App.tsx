import { Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { Agreements } from './pages/Agreements'
import { Applications } from './pages/Applications'
import { Dashboard } from './pages/Dashboard'
import { Maintenance } from './pages/Maintenance'
import { MaintenanceForm } from './pages/MaintenanceForm'
import { Messages } from './pages/Messages'
import { MessageThread } from './pages/MessageThread'
import { Notifications } from './pages/Notifications'
import { Properties } from './pages/Properties'
import { PropertyDetail } from './pages/PropertyDetail'
import { PropertyForm } from './pages/PropertyForm'
import { RentrAI } from './pages/RentrAI'
import { Shop } from './pages/Shop'
import { Todos } from './pages/Todos'
import { Viewings } from './pages/Viewings'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/new" element={<PropertyForm />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/properties/:id/edit" element={<PropertyForm />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/maintenance/new" element={<MaintenanceForm />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/viewings" element={<Viewings />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/agreements" element={<Agreements />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/ai" element={<RentrAI />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:id" element={<MessageThread />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="*"
          element={
            <div className="page">
              <div className="section">
                <div className="card empty">Page not found.</div>
              </div>
            </div>
          }
        />
      </Routes>
      <BottomNav />
    </div>
  )
}
