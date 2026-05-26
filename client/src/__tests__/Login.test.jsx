import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn(), user: null, loading: false }),
}));

const renderLogin = () => render(<MemoryRouter><Login /></MemoryRouter>);

describe('Login Page', () => {
  it('renders without crashing', () => {
    renderLogin();
    expect(document.body).toBeTruthy();
  });

  it('shows a login / sign-in button', () => {
    renderLogin();
    // From the DOM: button says "Sign In" or similar
    const btn = screen.queryByRole('button', { name: /sign in|login/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders an email input', () => {
    renderLogin();
    // From the DOM: input type="email" or name="email"
    const el = document.querySelector('input[type="email"], input[name="email"]');
    expect(el).toBeTruthy();
  });

  it('renders a password input', () => {
    renderLogin();
    const el = document.querySelector('input[type="password"], input[name="password"]');
    expect(el).toBeTruthy();
  });

  it('allows typing into the email field', () => {
    renderLogin();
    const el = document.querySelector('input[type="email"], input[name="email"]');
    fireEvent.change(el, { target: { value: 'teacher@miet.org' } });
    expect(el.value).toBe('teacher@miet.org');
  });

  it('allows typing into the password field', () => {
    renderLogin();
    const el = document.querySelector('input[type="password"], input[name="password"]');
    fireEvent.change(el, { target: { value: 'secret123' } });
    expect(el.value).toBe('secret123');
  });
});