// Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconMail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 10a3 3 0 1 0 4 4"/>
    <path d="M2 2l20 20"/>
    <path d="M6.7 6.7A10.6 10.6 0 0 0 2 12s3 7 10 7a10.7 10.7 0 0 0 5.3-1.4"/>
    <path d="M9.9 4.2A11.9 11.9 0 0 1 12 4c7 0 10 8 10 8a16.8 16.8 0 0 1-3.2 4.2"/>
  </svg>
);

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  overscroll-behavior: none;
  overflow-x: hidden;
  font-family: 'DM Sans', sans-serif;
  background: #f5f7fb;
}

:root {
  --primary: #8884d8;
  --secondary: #82ca9d;
  --accent: #0088FE;
  --light: #ffffff;
  --bg: #f5f7fb;
  --dark: #1e293b;
  --muted: #64748b;
  --border: #dbe4f0;
  --danger: #dc2626;
  --r: 16px;
}

.login-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.login-left {
  position: relative;
  overflow: hidden;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background: linear-gradient(
    180deg,
    #8884d8 0%,
    #6f6ad9 45%,
    #82ca9d 100%
  );
}

.login-left::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: rgba(255,255,255,.08);
  border-radius: 50%;
  top: -180px;
  right: -120px;
}

.login-left::after {
  content: '';
  position: absolute;
  width: 350px;
  height: 350px;
  background: rgba(255,255,255,.06);
  border-radius: 50%;
  bottom: -120px;
  left: -120px;
}

.l-content {
  position: relative;
  z-index: 2;
}

.l-logo {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4rem;
}

.l-sublogo {
  font-size: .9rem;
  font-weight: 400;
  opacity: .85;
  margin-top: .3rem;
}

.l-headline {
  font-size: 3.4rem;
  line-height: 1.1;
  font-weight: 700;
  color: white;
  letter-spacing: -2px;
  max-width: 520px;
}

.l-headline span {
  color: #dff7e7;
}

.l-body {
  margin-top: 1.5rem;
  max-width: 520px;
  line-height: 1.8;
  color: rgba(255,255,255,.9);
  font-size: .96rem;
}

.l-stats {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.l-stat {
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 1rem 1.3rem;
  min-width: 140px;
}

.l-stat h3 {
  font-size: 2rem;
  color: white;
}

.l-stat p {
  color: rgba(255,255,255,.85);
  font-size: .85rem;
}

.l-footer {
  position: relative;
  z-index: 2;
  color: rgba(255,255,255,.75);
  font-size: .82rem;
}

.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: #f5f7fb;
}

.r-card {
  width: 100%;
  max-width: 430px;
  background: white;
  padding: 2.5rem;
  border-radius: 28px;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.08);
}

.r-heading {
  font-size: 2.3rem;
  color: var(--dark);
  font-weight: 700;
  margin-bottom: .5rem;
}

.r-sub {
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.r-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.r-field {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.r-label {
  font-size: .82rem;
  color: var(--dark);
  font-weight: 600;
}

.r-input-wrap {
  position: relative;
}

.r-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary);
}

.r-input {
  width: 100%;
  height: 54px;
  border-radius: 16px;
  border: 1.5px solid #dbe4f0;
  padding: 0 1rem 0 3rem;
  font-size: .92rem;
  outline: none;
  transition: .2s ease;
}

.r-input:focus {
  border-color: #8884d8;
  box-shadow: 0 0 0 4px rgba(136,132,216,.15);
}

.r-btn {
  margin-top: .5rem;
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    #8884d8,
    #82ca9d
  );
  color: white;
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  transition: .25s ease;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: .6rem;
}

.r-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(136,132,216,.25);
}

.r-error {
  background: #fee2e2;
  color: #dc2626;
  padding: .9rem 1rem;
  border-radius: 14px;
  margin-bottom: 1rem;
  font-size: .88rem;
}

.r-switch {
  margin-top: 2rem;
  text-align: center;
  color: var(--muted);
  font-size: .9rem;
}

.eye-btn{
  position:absolute;
  right:1rem;
  top:50%;
  transform:translateY(-50%);
  border:none;
  background:none;
  cursor:pointer;
  color:#8884d8;
  display:flex;
  align-items:center;
  justify-content:center;
}

.eye-btn:hover{
  color:#6f6ad9;
}

.r-switch button {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-weight: 700;
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-left {
    display: none;
  }

  .login-right {
    padding: 1.5rem;
  }

  .r-card {
    padding: 2rem;
  }
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 10px;
  padding: .45rem 1rem;
  font-size: .82rem;
  font-weight: 600;
  color: rgba(255,255,255,.9);
  cursor: pointer;
  transition: .2s ease;
  font-family: 'DM Sans', sans-serif;
  backdrop-filter: blur(8px);
  margin-bottom: 1.5rem;
}

.back-home-btn:hover {
  background: rgba(255,255,255,.25);
  color: white;
}

.back-home-btn-right {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: .45rem 1rem;
  font-size: .82rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: .2s ease;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 1.5rem;
}

.back-home-btn-right:hover {
  border-color: var(--primary);
  color: var(--primary);
}
`;

const roleRoutes = {
  ADMIN: '/admin',
  MANAGER: '/manager',
  FACILITATOR: '/facilitator',
  DONOR: '/donor',
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password);
      navigate(roleRoutes[user?.role] || '/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="login-shell">

        <div className="login-left">
          <div className="l-content">

            <button className="back-home-btn" onClick={() => navigate('/')}>
              <IconArrowLeft /> Back to Home
            </button>

            <div className="l-logo">
              MIET Africa
              <div className="l-sublogo">
                Education Transformation Platform
              </div>
            </div>

            <h1 className="l-headline">
              Transforming learning through
              <span> digital innovation</span>
            </h1>

            <p className="l-body">
              MIET Africa empowers schools, teachers, and communities
              across South Africa with modern educational technology,
              literacy programmes, and data-driven impact reporting.
            </p>

            <div className="l-stats">
              <div className="l-stat">
                <h3>35+</h3>
                <p>Years Impact</p>
              </div>

              <div className="l-stat">
                <h3>9</h3>
                <p>Provinces</p>
              </div>

              <div className="l-stat">
                <h3>1000+</h3>
                <p>Schools</p>
              </div>
            </div>
          </div>

          <div className="l-footer">
            © 2026 MIET Africa · POPIA Compliant
          </div>
        </div>

        <div className="login-right">
          <div className="r-card">

            <h2 className="r-heading">
              Welcome Back
            </h2>

            <p className="r-sub">
              Sign in to continue to the MIET Africa portal.
            </p>

            {error && (
              <div className="r-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="r-fields">

                <div className="r-field">
                  <label className="r-label">
                    Email Address
                  </label>

                  <div className="r-input-wrap">
                    <span className="r-icon">
                      <IconMail />
                    </span>

                    <input
                      className="r-input"
                      type="email"
                      placeholder="you@school.org.za"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="r-field">

<label className="r-label">
  Password
</label>

<div className="r-input-wrap">

  <span className="r-icon">
    <IconLock />
  </span>

  <input
    className="r-input"
    type={showPassword ? 'text' : 'password'}
    placeholder="Enter password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    style={{ paddingRight: '3rem' }}
  />

  <button
    type="button"
    className="eye-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <IconEyeOff /> : <IconEye />}
  </button>

</div>

</div>

                <button className="r-btn" type="submit">
                  Sign In
                  <IconArrow />
                </button>

              </div>
            </form>

            <div className="r-switch">
              New to the platform?{' '}
              <button onClick={() => navigate('/register')}>
                Register
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default Login;