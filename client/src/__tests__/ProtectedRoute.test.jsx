import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ─── Control what useAuth returns per test ────────────────────────────────────
// We define the mock return value BEFORE the module loads by using a
// module-level variable that the factory closes over.
let mockUser = null;

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, loading: false }),
}));

import ProtectedRoute from '../components/ProtectedRoute';

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login"         element={<div>Login Page</div>} />
        <Route path="/unauthorized"  element={<div>Unauthorized</div>} />
        <Route path="*"              element={<div>Not Found</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUser = null; // reset to unauthenticated before each test
  });

  it('blocks unauthenticated users — protected content is not shown', () => {
    mockUser = null;
    renderRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows authenticated users — protected content is shown', () => {
    mockUser = { id: '1', name: 'Sipho', role: 'FACILITATOR' };
    renderRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});