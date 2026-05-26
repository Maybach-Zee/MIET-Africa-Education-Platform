import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

const renderLanding = () =>
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );

describe('Landing Page', () => {
  it('renders without crashing', () => {
    renderLanding();
    expect(document.body).toBeTruthy();
  });

  it('displays MIET Africa branding', () => {
    renderLanding();
    expect(document.body.textContent.toLowerCase()).toMatch(/miet|africa|education/i);
  });

  it('has a call-to-action button or link', () => {
    renderLanding();
    const cta =
      screen.queryByRole('link', { name: /login|sign in|get started|learn more|register/i }) ||
      screen.queryByRole('button', { name: /login|sign in|get started|register/i });
    expect(cta).toBeInTheDocument();
  });
});