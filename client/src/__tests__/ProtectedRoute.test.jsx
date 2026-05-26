import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let mockUser = null;
let mockLoading = false;

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, loading: mockLoading }),
}));

import ProtectedRoute from '../components/ProtectedRoute';

// ProtectedRoute uses <Outlet /> not {children}
// So it must be used as a layout route with nested child routes
const renderRoute = (initialPath = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {/* ProtectedRoute wraps child routes via Outlet */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login"        element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>
    </MemoryRouter>
  );

const renderWithRole = (initialPath = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'FACILITATOR']} />}>
          <Route path="/dashboard" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login"        element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUser    = null;
    mockLoading = false;
  });

  it('redirects to login when user is not authenticated', () => {
    mockUser = null;
    renderRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the outlet when user is authenticated', () => {
    mockUser = { id: '1', name: 'Sipho', role: 'FACILITATOR' };
    renderRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading state when auth is loading', () => {
    mockLoading = true;
    mockUser    = null;
    renderRoute();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to /unauthorized when user lacks required role', () => {
    mockUser = { id: '1', role: 'DONOR' }; // DONOR not in allowedRoles
    renderWithRole();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });

  it('allows access when user has the required role', () => {
    mockUser = { id: '1', role: 'ADMIN' };
    renderWithRole();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});