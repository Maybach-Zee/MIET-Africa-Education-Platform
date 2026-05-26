import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// We use vi.mock at the top — each test re-renders with different user state
const renderRoute = (user) => {
  vi.resetModules();

  // Inline mock before importing component
  vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ user, loading: false }),
  }));

  const ProtectedRoute = require('../components/ProtectedRoute').default;

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
    renderRoute({ id: 1, name: 'Sipho', role: 'facilitator' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});