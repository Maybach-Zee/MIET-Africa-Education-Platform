import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    loading: false,
  }),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login Page', () => {
  it('renders without crashing', () => {
    renderLogin();
    expect(document.body).toBeTruthy();
  });

  it('shows a login / sign-in button', () => {
    renderLogin();
    expect(
      screen.getByRole('button', { name: /login|sign in/i })
    ).toBeInTheDocument();
  });

  it('renders an email input', () => {
    renderLogin();
    const el =
      screen.queryByPlaceholderText(/email/i) ||
      screen.queryByLabelText(/email/i);
    expect(el).toBeInTheDocument();
  });

  it('renders a password input', () => {
    renderLogin();
    const el =
      screen.queryByPlaceholderText(/password/i) ||
      screen.queryByLabelText(/password/i);
    expect(el).toBeInTheDocument();
  });

  it('allows typing into the email field', () => {
    renderLogin();
    const el =
      screen.queryByPlaceholderText(/email/i) ||
      screen.queryByLabelText(/email/i);
    fireEvent.change(el, { target: { value: 'teacher@miet.org' } });
    expect(el.value).toBe('teacher@miet.org');
  });

  it('allows typing into the password field', () => {
    renderLogin();
    const el =
      screen.queryByPlaceholderText(/password/i) ||
      screen.queryByLabelText(/password/i);
    fireEvent.change(el, { target: { value: 'secret123' } });
    expect(el.value).toBe('secret123');
  });
});