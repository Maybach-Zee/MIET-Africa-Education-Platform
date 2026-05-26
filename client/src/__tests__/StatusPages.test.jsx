import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Unauthorized from '../pages/Unauthorized';
import PendingApproval from '../pages/auth/PendingApproval';
import SchoolRejected from '../pages/auth/SchoolRejected';
import SchoolDeactivated from '../pages/auth/SchoolDeactivated';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, logout: vi.fn() }),
}));

const wrap = (Component) =>
  render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  );

describe('Unauthorized Page', () => {
  it('renders without crashing', () => {
    wrap(Unauthorized);
    expect(document.body).toBeTruthy();
  });

  it('displays an unauthorized / access denied message', () => {
    wrap(Unauthorized);
    expect(document.body.textContent.toLowerCase()).toMatch(
      /unauthorized|access denied|not allowed|permission/i
    );
  });
});

describe('PendingApproval Page', () => {
  it('renders without crashing', () => {
    wrap(PendingApproval);
    expect(document.body).toBeTruthy();
  });

  it('tells the user their account is pending', () => {
    wrap(PendingApproval);
    expect(document.body.textContent.toLowerCase()).toMatch(
      /pending|approval|waiting|under review/i
    );
  });
});

describe('SchoolRejected Page', () => {
  it('renders without crashing', () => {
    wrap(SchoolRejected);
    expect(document.body).toBeTruthy();
  });

  it('shows a rejection message', () => {
    wrap(SchoolRejected);
    expect(document.body.textContent.toLowerCase()).toMatch(
      /rejected|not approved|declined/i
    );
  });
});

describe('SchoolDeactivated Page', () => {
  it('renders without crashing', () => {
    wrap(SchoolDeactivated);
    expect(document.body).toBeTruthy();
  });

  it('shows a deactivated message', () => {
    wrap(SchoolDeactivated);
    expect(document.body.textContent.toLowerCase()).toMatch(
      /deactivated|inactive|suspended|disabled/i
    );
  });
});