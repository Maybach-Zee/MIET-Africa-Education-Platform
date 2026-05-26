import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock AuthContext inline — vi.mock is hoisted by Vitest
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false })),
}));

import { useAuth } from '../contexts/AuthContext';

const renderRoute = (user) => {
  useAuth.mockReturnValue({ user, loading: false });

  return render(
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
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('blocks unauthenticated users — protected content is not shown', () => {
    renderRoute(null);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows authenticated users — protected content is shown', () => {
    renderRoute({ id: '1', name: 'Sipho', role: 'FACILITATOR' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});