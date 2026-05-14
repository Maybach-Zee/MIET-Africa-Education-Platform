import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import ManageResources from './pages/admin/ManageResources';
import ManageSchools from './pages/admin/ManageSchools';
import Reports from './pages/admin/Reports';
import Events from './pages/admin/Events';
import Donations from './pages/admin/Donations';
import ManageUsers from './pages/admin/ManageUsers';
import MyCourses from './pages/facilitator/MyCourses';
import SessionAttendance from './pages/facilitator/SessionAttendance';
import Assessments from './pages/facilitator/Assessments';
import DonorPortal from './pages/donor/DonorPortal';
import Unauthorized from './pages/Unauthorized';
import PublicImpact from './pages/donor/PublicImpact';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN','MANAGER']} />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resources" element={<ManageResources />} />
              <Route path="/schools" element={<ManageSchools />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/events" element={<Events />} />
              <Route path="/donations" element={<Donations />} />
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/users" element={<ManageUsers />} />
              </Route>
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['FACILITATOR']} />}>
            <Route element={<Layout />}>
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/sessions" element={<SessionAttendance />} />
              <Route path="/assessments" element={<Assessments />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['DONOR']} />}>
            <Route element={<Layout />}>
              <Route path="/donor" element={<DonorPortal />} />
              <Route path="/donor/donations" element={<Donations />} />
              <Route path="/impact" element={<PublicImpact />} />
            </Route>
          </Route>

          {/* Principal / Manager */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route element={<Layout />}>
              <Route path="/principal" element={<PrincipalDashboard />} />
            </Route>
          </Route>
          
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;