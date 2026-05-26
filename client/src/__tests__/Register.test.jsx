import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/auth/Register';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn(),
    user: null,
    loading: false,
  }),
}));

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe('Register Page', () => {
  it('renders without crashing', () => {
    renderRegister();
    expect(document.body).toBeTruthy();
  });

  it('shows a register / sign-up button', () => {
    renderRegister();
    expect(
      screen.getByRole('button', { name: /register|sign up|create account/i })
    ).toBeInTheDocument();
  });

  it('renders an email input', () => {
    renderRegister();
    const el =
      screen.queryByPlaceholderText(/email/i) ||
      screen.queryByLabelText(/email/i);
    expect(el).toBeInTheDocument();
  });

  it('renders a password input', () => {
    renderRegister();
    const el =
      screen.queryByPlaceholderText(/password/i) ||
      screen.queryByLabelText(/password/i);
    expect(el).toBeInTheDocument();
  });

  it('shows a link back to login', () => {
    renderRegister();
    const link = screen.queryByRole('link', { name: /login|sign in|already have/i });
    expect(link).toBeInTheDocument();
  });
});