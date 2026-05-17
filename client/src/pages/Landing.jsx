// Landing.jsx

import { useNavigate } from 'react-router-dom';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconGlobe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconSchool = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── CSS ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  overscroll-behavior: none;
  overflow-x: hidden;
  font-family: 'DM Sans', sans-serif;
  background: #f5f7fb;
}

:root {
  --primary: #8884d8;
  --secondary: #82ca9d;
  --dark: #1e293b;
  --muted: #64748b;
  --border: #dbe4f0;
  --bg: #f5f7fb;
}

/* ── NAV ── */
.land-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 4rem;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(219,228,240,0.6);
}

.nav-logo {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--dark);
}

.nav-logo span {
  color: var(--primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
}

.nav-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: .9rem;
  font-weight: 500;
  transition: color .2s;
}

.nav-links a:hover {
  color: var(--primary);
}

.nav-actions {
  display: flex;
  gap: .8rem;
}

.btn-ghost {
  height: 42px;
  padding: 0 1.4rem;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  background: white;
  color: var(--dark);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  transition: .2s ease;
  font-family: 'DM Sans', sans-serif;
}

.btn-ghost:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-primary {
  height: 42px;
  padding: 0 1.4rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8884d8, #82ca9d);
  color: white;
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition: .25s ease;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: .5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(136,132,216,.3);
}

/* ── HERO ── */
.land-hero {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 4rem 5rem;

  background: linear-gradient(
    160deg,
    #8884d8 0%,
    #6f6ad9 40%,
    #82ca9d 100%
  );
}

.land-hero::before {
  content: '';
  position: absolute;
  width: 700px;
  height: 700px;
  background: rgba(255,255,255,.07);
  border-radius: 50%;
  top: -250px;
  right: -200px;
  pointer-events: none;
}

.land-hero::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: rgba(255,255,255,.05);
  border-radius: 50%;
  bottom: -200px;
  left: -150px;
  pointer-events: none;
}

.hero-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
}

.hero-left {}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 100px;
  padding: .4rem 1rem;
  color: white;
  font-size: .82rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.hero-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #dff7e7;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .6; transform: scale(1.3); }
}

.hero-h1 {
  font-size: 4rem;
  line-height: 1.05;
  font-weight: 700;
  color: white;
  letter-spacing: -2.5px;
  margin-bottom: 1.5rem;
}

.hero-h1 span {
  color: #dff7e7;
}

.hero-body {
  color: rgba(255,255,255,.9);
  font-size: 1.05rem;
  line-height: 1.8;
  max-width: 500px;
  margin-bottom: 2.5rem;
}

.hero-ctas {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-primary {
  height: 56px;
  padding: 0 2rem;
  border: none;
  border-radius: 16px;
  background: white;
  color: var(--primary);
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  transition: .25s ease;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: .6rem;
  box-shadow: 0 8px 24px rgba(0,0,0,.15);
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(0,0,0,.2);
}

.cta-secondary {
  height: 56px;
  padding: 0 2rem;
  border: 2px solid rgba(255,255,255,.4);
  border-radius: 16px;
  background: rgba(255,255,255,.12);
  backdrop-filter: blur(10px);
  color: white;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  transition: .25s ease;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: .6rem;
}

.cta-secondary:hover {
  background: rgba(255,255,255,.2);
  border-color: rgba(255,255,255,.6);
}

.hero-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.hero-stat-card {
  background: rgba(255,255,255,.13);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(14px);
  border-radius: 22px;
  padding: 1.4rem 1.5rem;
}

.hero-stat-card h3 {
  font-size: 2.4rem;
  font-weight: 700;
  color: white;
  letter-spacing: -1px;
  line-height: 1;
}

.hero-stat-card p {
  margin-top: .3rem;
  color: rgba(255,255,255,.8);
  font-size: .85rem;
}

.hero-quote-card {
  background: rgba(255,255,255,.13);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(14px);
  border-radius: 22px;
  padding: 1.6rem;
}

.hero-quote-card p {
  color: rgba(255,255,255,.9);
  font-size: .95rem;
  line-height: 1.7;
  font-style: italic;
}

.hero-quote-card cite {
  margin-top: .8rem;
  display: block;
  color: #dff7e7;
  font-size: .82rem;
  font-style: normal;
  font-weight: 600;
}

/* ── PROGRAMMES ── */
.land-section {
  padding: 6rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-tag {
  display: inline-block;
  background: rgba(136,132,216,.1);
  color: var(--primary);
  border-radius: 100px;
  padding: .3rem .9rem;
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.section-heading {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.section-heading span {
  background: linear-gradient(135deg, #8884d8, #82ca9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-sub {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 580px;
  margin-bottom: 3rem;
}

.prog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.prog-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  border: 1.5px solid var(--border);
  transition: .25s ease;
  cursor: default;
}

.prog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(136,132,216,.12);
  border-color: rgba(136,132,216,.3);
}

.prog-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(136,132,216,.15), rgba(130,202,157,.15));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin-bottom: 1.2rem;
}

.prog-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: .6rem;
}

.prog-card p {
  color: var(--muted);
  font-size: .88rem;
  line-height: 1.7;
}

.prog-card-badge {
  margin-top: 1.2rem;
  display: inline-block;
  background: rgba(136,132,216,.08);
  color: var(--primary);
  font-size: .75rem;
  font-weight: 700;
  border-radius: 100px;
  padding: .25rem .8rem;
}

/* ── IMPACT NUMBERS ── */
.land-impact {
  background: linear-gradient(160deg, #8884d8 0%, #6f6ad9 50%, #82ca9d 100%);
  padding: 5rem 4rem;
  position: relative;
  overflow: hidden;
}

.land-impact::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: rgba(255,255,255,.06);
  border-radius: 50%;
  top: -200px;
  right: -200px;
}

.impact-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.impact-inner .section-tag {
  background: rgba(255,255,255,.15);
  color: white;
}

.impact-inner .section-heading {
  color: white;
  margin: 0 auto 1rem;
}

.impact-inner .section-heading span {
  background: none;
  -webkit-text-fill-color: #dff7e7;
}

.impact-inner .section-sub {
  color: rgba(255,255,255,.85);
  margin: 0 auto 3rem;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.impact-card {
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(14px);
  border-radius: 24px;
  padding: 2rem 1.5rem;
  text-align: center;
}

.impact-card h3 {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  letter-spacing: -1.5px;
  line-height: 1;
}

.impact-card p {
  margin-top: .5rem;
  color: rgba(255,255,255,.8);
  font-size: .88rem;
  line-height: 1.5;
}

/* ── HOW IT WORKS ── */
.how-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  counter-reset: steps;
}

.how-step {
  position: relative;
  padding-left: 1rem;
}

.how-num {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, rgba(136,132,216,.2), rgba(130,202,157,.2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: .8rem;
}

.how-step h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: .6rem;
}

.how-step p {
  color: var(--muted);
  font-size: .9rem;
  line-height: 1.7;
}

.how-checklist {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.how-check {
  display: flex;
  align-items: center;
  gap: .5rem;
  color: var(--muted);
  font-size: .85rem;
}

.how-check-icon {
  color: var(--secondary);
  flex-shrink: 0;
}

/* ── ROLES ── */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.role-card {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  transition: .25s ease;
}

.role-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(136,132,216,.1);
  border-color: rgba(136,132,216,.3);
}

.role-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(136,132,216,.15), rgba(130,202,157,.15));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.role-card h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: .4rem;
}

.role-card p {
  color: var(--muted);
  font-size: .87rem;
  line-height: 1.65;
}

/* ── CTA BANNER ── */
.land-cta-banner {
  margin: 0 4rem 5rem;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #8884d8, #6f6ad9 50%, #82ca9d);
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.land-cta-banner::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255,255,255,.07);
  border-radius: 50%;
  top: -150px;
  right: -100px;
}

.cta-banner-text {
  position: relative;
  z-index: 2;
}

.cta-banner-text h2 {
  font-size: 2.4rem;
  font-weight: 700;
  color: white;
  letter-spacing: -1px;
  margin-bottom: .8rem;
}

.cta-banner-text h2 span {
  color: #dff7e7;
}

.cta-banner-text p {
  color: rgba(255,255,255,.85);
  font-size: .98rem;
  line-height: 1.7;
  max-width: 460px;
}

.cta-banner-btns {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* ── FOOTER ── */
.land-footer {
  background: var(--dark);
  padding: 4rem;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(255,255,255,.1);
}

.footer-brand p {
  color: rgba(255,255,255,.55);
  font-size: .87rem;
  line-height: 1.7;
  margin-top: .8rem;
  max-width: 280px;
}

.footer-logo {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
}

.footer-logo span {
  color: #82ca9d;
}

.footer-col h4 {
  color: white;
  font-size: .88rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: .6rem;
}

.footer-col ul li {
  color: rgba(255,255,255,.55);
  font-size: .85rem;
  cursor: pointer;
  transition: color .2s;
}

.footer-col ul li:hover {
  color: #82ca9d;
}

.footer-bottom {
  max-width: 1200px;
  margin: 2rem auto 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255,255,255,.4);
  font-size: .82rem;
}

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .prog-grid { grid-template-columns: 1fr 1fr; }
  .impact-grid { grid-template-columns: 1fr 1fr; }
  .footer-inner { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 900px) {
  .land-nav { padding: 1rem 1.5rem; }
  .nav-links { display: none; }
  .land-hero { padding: 7rem 1.5rem 4rem; }
  .hero-inner { grid-template-columns: 1fr; gap: 3rem; }
  .hero-h1 { font-size: 2.8rem; }
  .land-section { padding: 4rem 1.5rem; }
  .prog-grid { grid-template-columns: 1fr; }
  .how-grid { grid-template-columns: 1fr; }
  .roles-grid { grid-template-columns: 1fr; }
  .land-impact { padding: 4rem 1.5rem; }
  .impact-grid { grid-template-columns: 1fr 1fr; }
  .land-cta-banner { margin: 0 1.5rem 4rem; padding: 2.5rem; flex-direction: column; }
  .land-footer { padding: 3rem 1.5rem; }
  .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
  .footer-bottom { flex-direction: column; gap: .5rem; text-align: center; }
  .section-heading { font-size: 2.1rem; }
}
`;

// ── DATA ──────────────────────────────────────────────────────────────────
const programmes = [
  {
    icon: <IconBook />,
    title: 'Literacy & Numeracy',
    description:
      'Early Grade Reading Assessments (EGRA) and structured literacy programmes that equip Foundation Phase learners with foundational reading and maths skills.',
    badge: 'Foundation Phase',
  },
  {
    icon: <IconUsers />,
    title: 'Teacher Development',
    description:
      'Professional development workshops, coaching, and mentoring for teachers across all nine provinces — building classroom confidence and subject knowledge.',
    badge: 'All Phases',
  },
  {
    icon: <IconChart />,
    title: 'Data-Driven Impact',
    description:
      'Real-time dashboards and assessment tools that help school managers and facilitators track learner progress and programme effectiveness.',
    badge: 'Monitoring & Evaluation',
  },
  {
    icon: <IconGlobe />,
    title: 'Digital Learning',
    description:
      'Technology integration in the classroom — from tablets and connectivity solutions to digital content aligned with the CAPS curriculum.',
    badge: 'EdTech',
  },
  {
    icon: <IconSchool />,
    title: 'School Support',
    description:
      'Whole-school development through structured support visits, school management training, and community engagement programmes.',
    badge: 'Management',
  },
  {
    icon: <IconHeart />,
    title: 'Donor Partnerships',
    description:
      'Transparent impact reporting for corporate and individual donors — track exactly how your contribution transforms learners across South Africa.',
    badge: 'Philanthropy',
  },
];

const roles = [
  {
    icon: <IconUsers />,
    title: 'Administrators',
    description:
      'Full platform oversight — manage schools, users, programmes and generate national impact reports across all nine provinces.',
  },
  {
    icon: <IconChart />,
    title: 'Programme Managers',
    description:
      'Oversee facilitator activities, track school progress, manage resource deployment and review assessment data in your region.',
  },
  {
    icon: <IconSchool />,
    title: 'Facilitators',
    description:
      'Log school visits, capture learner assessments, submit teacher training records and communicate with your programme manager.',
  },
  {
    icon: <IconHeart />,
    title: 'Donors',
    description:
      'Access personalised dashboards showing the real-world impact of your funding — schools reached, learners supported, and outcomes achieved.',
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className="land-nav">
        <div className="nav-logo">
          MIET <span>Africa</span>
        </div>

        <ul className="nav-links">
          <li><a href="#programmes">Programmes</a></li>
          <li><a href="#impact">Impact</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#platform">Platform</a></li>
        </ul>

        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            Register School <IconArrow />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="land-hero">
        <div className="hero-inner">

          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              35+ Years Transforming Education in Africa
            </div>

            <h1 className="hero-h1">
              Education that<br />
              <span>changes lives</span><br />
              across South Africa
            </h1>

            <p className="hero-body">
              MIET Africa partners with schools, teachers, and communities to deliver
              literacy programmes, teacher development, and data-driven impact across
              all nine provinces — from classrooms to communities.
            </p>

            <div className="hero-ctas">
              <button className="cta-primary" onClick={() => navigate('/register')}>
                Register Your School <IconArrow />
              </button>
              <button className="cta-secondary" onClick={() => navigate('/login')}>
                Sign In to Platform
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-stats-grid">
              {[
                { num: '35+', label: 'Years of Impact' },
                { num: '9', label: 'SA Provinces' },
                { num: '1 000+', label: 'Schools Supported' },
                { num: '500K+', label: 'Learners Reached' },
              ].map((s) => (
                <div className="hero-stat-card" key={s.num}>
                  <h3>{s.num}</h3>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="hero-quote-card">
              <p>
                "MIET Africa has been at the forefront of educational transformation —
                empowering teachers, strengthening schools, and giving every learner
                the opportunity to thrive."
              </p>
              <cite>— MIET Africa Mission Statement</cite>
            </div>
          </div>

        </div>
      </section>

      {/* PROGRAMMES */}
      <div id="programmes" style={{ background: '#f5f7fb' }}>
        <div className="land-section">
          <div className="section-tag">Our Programmes</div>
          <h2 className="section-heading">
            Building futures through<br />
            <span>purposeful education</span>
          </h2>
          <p className="section-sub">
            From Foundation Phase literacy to school management support, our
            programmes are designed to deliver measurable, lasting change in
            South African communities.
          </p>

          <div className="prog-grid">
            {programmes.map((p) => (
              <div className="prog-card" key={p.title}>
                <div className="prog-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <span className="prog-card-badge">{p.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IMPACT */}
      <div id="impact">
        <div className="land-impact">
          <div className="impact-inner">
            <div className="section-tag">Measurable Impact</div>
            <h2 className="section-heading">
              Real results in<br />
              <span>real classrooms</span>
            </h2>
            <p className="section-sub">
              Our data-driven approach means every programme is monitored, evaluated,
              and refined — so your investment translates directly into learner outcomes.
            </p>

            <div className="impact-grid">
              {[
                { num: '35+', label: 'Years operating across Southern & East Africa' },
                { num: '9/9', label: 'South African provinces with active programmes' },
                { num: '1 000+', label: 'Schools in the MIET Africa network' },
                { num: '500K+', label: 'Learners impacted through our programmes' },
              ].map((i) => (
                <div className="impact-card" key={i.num}>
                  <h3>{i.num}</h3>
                  <p>{i.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" style={{ background: 'white' }}>
        <div className="land-section">
          <div className="section-tag">How It Works</div>
          <h2 className="section-heading">
            From registration to<br />
            <span>measurable impact</span>
          </h2>
          <p className="section-sub">
            The MIET Africa platform connects schools, facilitators, managers,
            and donors in one unified system — making programme delivery
            transparent and effective.
          </p>

          <div className="how-grid">
            <div className="how-step">
              <div className="how-num">01</div>
              <h3>Register Your School</h3>
              <p>
                Submit your school details and location. Our team verifies your
                application and connects you to the right programmes for your
                province and phase.
              </p>
              <div className="how-checklist">
                {['School profile & location', 'Province & city selection', 'Administrator review'].map(item => (
                  <div className="how-check" key={item}>
                    <span className="how-check-icon"><IconCheck /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="how-step">
              <div className="how-num">02</div>
              <h3>Access Programme Tools</h3>
              <p>
                Facilitators log school visits, capture assessments, and track
                learner progress. Managers oversee their region through real-time
                dashboards.
              </p>
              <div className="how-checklist">
                {['Visit & assessment logging', 'Teacher training records', 'Real-time dashboards'].map(item => (
                  <div className="how-check" key={item}>
                    <span className="how-check-icon"><IconCheck /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="how-step">
              <div className="how-num">03</div>
              <h3>Report Transparent Impact</h3>
              <p>
                Donors and administrators see exactly where funding goes — from
                which schools are reached to how many learners benefit from each
                programme.
              </p>
              <div className="how-checklist">
                {['Donor impact dashboards', 'National outcome reports', 'POPIA-compliant data'].map(item => (
                  <div className="how-check" key={item}>
                    <span className="how-check-icon"><IconCheck /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLATFORM ROLES */}
      <div id="platform" style={{ background: '#f5f7fb' }}>
        <div className="land-section">
          <div className="section-tag">The Platform</div>
          <h2 className="section-heading">
            Built for everyone<br />
            <span>in the network</span>
          </h2>
          <p className="section-sub">
            Whether you're a school facilitator on the ground or a corporate donor
            reviewing impact — the MIET Africa portal has a tailored experience for
            your role.
          </p>

          <div className="roles-grid">
            {roles.map((r) => (
              <div className="role-card" key={r.title}>
                <div className="role-icon">{r.icon}</div>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="land-cta-banner">
        <div className="cta-banner-text">
          <h2>
            Ready to join the<br />
            <span>education movement?</span>
          </h2>
          <p>
            Register your school today and gain access to MIET Africa's full suite
            of literacy tools, teacher development resources, and impact reporting.
          </p>
        </div>
        <div className="cta-banner-btns">
          <button className="cta-primary" onClick={() => navigate('/register')}>
            Register School <IconArrow />
          </button>
          <button className="cta-secondary" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="land-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">MIET <span>Africa</span></div>
            <p>
              Transforming education across Southern and East Africa through
              literacy programmes, teacher development, and data-driven impact
              reporting since 1989.
            </p>
          </div>

          <div className="footer-col">
            <h4>Programmes</h4>
            <ul>
              <li>Literacy & Numeracy</li>
              <li>Teacher Development</li>
              <li>Digital Learning</li>
              <li>School Support</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li onClick={() => navigate('/login')}>Sign In</li>
              <li onClick={() => navigate('/register')}>Register School</li>
              <li onClick={() => navigate('/impact')}>Donor Portal</li>
              <li>Impact Reports</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Organisation</h4>
            <ul>
              <li>About MIET Africa</li>
              <li>News & Stories</li>
              <li>Contact Us</li>
              <li>POPIA Policy</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 MIET Africa. All rights reserved.</span>
          <span>POPIA Compliant · Non-Profit Organisation · Est. 1989</span>
        </div>
      </footer>
    </>
  );
};

export default Landing;