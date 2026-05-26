import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const AuthConsumer = () => {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : 'no-user'}</span>
    </div>
  );
};

const renderWithAuth = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </MemoryRouter>
  );

describe('AuthContext', () => {
  it('renders children without crashing', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <div>Child Content</div>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('provides unauthenticated state by default', () => {
    renderWithAuth();
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });

  it('loading is a boolean', () => {
    renderWithAuth();
    expect(['true', 'false']).toContain(
      screen.getByTestId('loading').textContent
    );
  });
});