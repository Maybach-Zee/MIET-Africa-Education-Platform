import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireActiveSchool from './components/RequireActiveSchool';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import ManageResources from './pages/admin/ManageResources';
import ManageSchools from './pages/admin/ManageSchools';
import Reports from './pages/admin/Reports';
import Events from './pages/admin/Events';
import Donations from './pages/admin/Donations';
import ManageUsers from './pages/admin/ManageUsers';
import SessionAttendance from './pages/facilitator/SessionAttendance';
import Assessments from './pages/facilitator/Assessments';
import DonorPortal from './pages/donor/DonorPortal';
import PublicImpact from './pages/donor/PublicImpact';
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import PrincipalEvents from './pages/principal/Events';
import SchoolReports from './pages/principal/SchoolReports';
import RegisterSchool from './pages/principal/RegisterSchool';
import Unauthorized from './pages/Unauthorized';
import FacilitatorDashboard from './pages/facilitator/Dashboard';
import Home from './pages/Home';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />   // fallback to home
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/impact" element={<PublicImpact />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/resources" element={<ManageResources />} />
              <Route path="/admin/schools" element={<ManageSchools />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/events" element={<Events />} />
              <Route path="/admin/donations" element={<Donations />} />
              <Route path="/admin/users" element={<ManageUsers />} />
            </Route>
          </Route>

          {/* Manager routes */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
          <Route element={<RequireActiveSchool />}>
            <Route element={<Layout />}>
              <Route path="/manager" element={<PrincipalDashboard />} />
              <Route path="/manager/events" element={<PrincipalEvents />} />
              <Route path="/manager/reports" element={<SchoolReports />} />
              <Route path="/manager/my-school" element={<RegisterSchool />} />
            </Route>
            </Route>
          </Route>

          {/* Facilitator routes */}
          <Route element={<ProtectedRoute allowedRoles={['FACILITATOR']} />}>
          <Route element={<RequireActiveSchool />}>
            <Route element={<Layout />}>
              <Route path="/facilitator" element={<FacilitatorDashboard />} />
              <Route path="/facilitator/sessions" element={<SessionAttendance />} />
              <Route path="/facilitator/assessments" element={<Assessments />} />
            </Route>
            </Route>
          </Route>

          {/* Donor routes */}
          <Route element={<ProtectedRoute allowedRoles={['DONOR']} />}>
            <Route element={<Layout />}>
              <Route path="/donor" element={<DonorPortal />} />
              <Route path="/donor/donations" element={<Donations />} />
              <Route path="/donor/impact" element={<PublicImpact />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;