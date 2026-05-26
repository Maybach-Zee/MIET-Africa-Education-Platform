import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/auth/Register';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ register: vi.fn(), user: null, loading: false }),
}));

const renderRegister = () => render(<MemoryRouter><Register /></MemoryRouter>);

describe('Register Page', () => {
  it('renders without crashing', () => {
    renderRegister();
    expect(document.body).toBeTruthy();
  });

  it('shows a submit registration button', () => {
    renderRegister();
    // From the DOM: button name is "Submit Registration"
    const btn = screen.queryByRole('button', { name: /submit registration/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders an email input', () => {
    renderRegister();
    // From the DOM: input name="email" placeholder="you@school.org.za"
    const el = document.querySelector('input[name="email"]');
    expect(el).toBeTruthy();
  });

  it('renders a full name input', () => {
    renderRegister();
    // From the DOM: input name="full_name" placeholder="Jane Dlamini"
    const el = document.querySelector('input[name="full_name"]');
    expect(el).toBeTruthy();
  });

  it('renders a school name input', () => {
    renderRegister();
    // From the DOM: input name="centre_name"
    const el = document.querySelector('input[name="centre_name"]');
    expect(el).toBeTruthy();
  });

  it('renders a province selector', () => {
    renderRegister();
    // From the DOM: select name="province_id"
    const el = document.querySelector('select[name="province_id"]');
    expect(el).toBeTruthy();
  });

  it('shows a link or button to sign in', () => {
    renderRegister();
    // From the DOM: button type="button" with text "Sign In"
    const el = screen.queryByRole('button', { name: /sign in/i });
    expect(el).toBeInTheDocument();
  });
});