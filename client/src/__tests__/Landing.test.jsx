import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

const renderLanding = () => render(<MemoryRouter><Landing /></MemoryRouter>);

describe('Landing Page', () => {
  it('renders without crashing', () => {
    renderLanding();
    expect(document.body).toBeTruthy();
  });

  it('displays MIET Africa branding', () => {
    renderLanding();
    expect(document.body.textContent.toLowerCase()).toMatch(/miet|africa/i);
  });

  it('has at least one call-to-action button', () => {
    renderLanding();
    // From the DOM: multiple CTA buttons exist — use getAllByRole
    const btns = screen.getAllByRole('button', { name: /register|sign in/i });
    expect(btns.length).toBeGreaterThan(0);
  });

  it('shows navigation links', () => {
    renderLanding();
    // From the DOM: nav links for Programmes, Impact, How It Works, Platform
    expect(screen.getByRole('link', { name: /programmes/i })).toBeInTheDocument();
  });

  it('shows impact statistics', () => {
    renderLanding();
    // From the DOM: "35+ Years of Impact", "9 SA Provinces" etc.
    expect(document.body.textContent).toMatch(/35\+|500K\+|1 000\+/);
  });
});