import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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

const IconCert = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconSchool = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconTeacher = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
  </svg>
);

const IconSpin = () => (
  <svg className="pi-spin" width="20" height="20" viewBox="0 0 24 24">
    <circle className="pi-spin-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeOpacity="0.25"/>
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/>
  </svg>
);

// ── CSS ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
.pi-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 4rem;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(219,228,240,0.6);
}

.pi-nav-logo {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--dark);
}
.pi-nav-logo span { color: var(--primary); }

.pi-back-btn {
  display: flex;
  align-items: center;
  gap: .5rem;
  height: 40px;
  padding: 0 1.2rem;
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
.pi-back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateX(-2px);
}

/* ── HERO ── */
.pi-hero {
  position: relative;
  overflow: hidden;
  min-height: 56vh;
  display: flex;
  align-items: center;
  padding: 8rem 4rem 5rem;
  background: linear-gradient(160deg, #8884d8 0%, #6f6ad9 40%, #82ca9d 100%);
}

.pi-hero::before {
  content: '';
  position: absolute;
  width: 700px; height: 700px;
  background: rgba(255,255,255,.07);
  border-radius: 50%;
  top: -250px; right: -200px;
  pointer-events: none;
}
.pi-hero::after {
  content: '';
  position: absolute;
  width: 400px; height: 400px;
  background: rgba(255,255,255,.05);
  border-radius: 50%;
  bottom: -150px; left: -100px;
  pointer-events: none;
}

.pi-hero-inner {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.pi-hero-badge {
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
.pi-badge-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #dff7e7;
  animation: pi-pulse 2s infinite;
}
@keyframes pi-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .6; transform: scale(1.3); }
}

.pi-hero h1 {
  font-size: 3.6rem;
  line-height: 1.05;
  font-weight: 700;
  color: white;
  letter-spacing: -2px;
  margin-bottom: 1.2rem;
}
.pi-hero h1 span {
  color: #dff7e7;
}

.pi-hero-body {
  color: rgba(255,255,255,.9);
  font-size: 1.05rem;
  line-height: 1.8;
  max-width: 540px;
  margin-bottom: 2.5rem;
}

/* ── LIVE STATS BAR ── */
.pi-stats-bar {
  background: white;
  border-radius: 28px;
  padding: 2.5rem 3rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  box-shadow: 0 20px 60px rgba(136,132,216,.15);
  max-width: 1200px;
  margin: -2.5rem auto 0;
  position: relative;
  z-index: 10;
}

.pi-stat-item {
  text-align: center;
  padding: 1rem;
  border-radius: 18px;
  transition: .25s ease;
}
.pi-stat-item:hover {
  background: rgba(136,132,216,.06);
}

.pi-stat-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(136,132,216,.12), rgba(130,202,157,.12));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  margin: 0 auto .8rem;
}

.pi-stat-num {
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: -1.5px;
  line-height: 1;
}
.pi-stat-num.indigo { color: var(--primary); }
.pi-stat-num.purple { color: #a78bfa; }
.pi-stat-num.green  { color: #22c55e; }
.pi-stat-num.orange { color: #f97316; }

.pi-stat-label {
  margin-top: .3rem;
  color: var(--muted);
  font-size: .85rem;
  font-weight: 500;
}

/* ── SECTION WRAPPER ── */
.pi-section {
  padding: 6rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.pi-section-tag {
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

.pi-section-heading {
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin-bottom: 1rem;
}
.pi-section-heading span {
  background: linear-gradient(135deg, #8884d8, #82ca9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pi-section-sub {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 560px;
  margin-bottom: 3rem;
}

/* ── DONATION FORM ── */
.pi-form-wrap {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 3rem;
  align-items: start;
}

.pi-form-side {}

.pi-form-card {
  background: white;
  border-radius: 28px;
  padding: 2.8rem;
  border: 1.5px solid var(--border);
  box-shadow: 0 8px 40px rgba(136,132,216,.08);
}

.pi-form-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: -.5px;
  margin-bottom: .4rem;
}

.pi-form-card .pi-form-sub {
  color: var(--muted);
  font-size: .88rem;
  margin-bottom: 2rem;
}

.pi-field {
  margin-bottom: 1.2rem;
}

.pi-field label {
  display: block;
  font-size: .85rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: .45rem;
}

.pi-field input,
.pi-field select {
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-size: .92rem;
  font-family: 'DM Sans', sans-serif;
  color: var(--dark);
  background: #fafbfe;
  transition: .2s ease;
  outline: none;
  -webkit-appearance: none;
}
.pi-field input:focus,
.pi-field select:focus {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(136,132,216,.12);
}

.pi-field input::placeholder { color: #94a3b8; }

.pi-amount-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .6rem;
  margin-bottom: .8rem;
}

.pi-amount-chip {
  padding: .55rem .4rem;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  background: white;
  font-size: .85rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: .2s ease;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
}
.pi-amount-chip:hover,
.pi-amount-chip.active {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(136,132,216,.07);
}

.pi-submit-btn {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #8884d8, #82ca9d);
  color: white;
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  transition: .25s ease;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .6rem;
  margin-top: 1.6rem;
  box-shadow: 0 8px 24px rgba(136,132,216,.3);
}
.pi-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(136,132,216,.4);
}
.pi-submit-btn:disabled { opacity: .6; cursor: not-allowed; }

@keyframes pi-spin-anim {
  to { transform: rotate(360deg); }
}
.pi-spin { animation: pi-spin-anim .8s linear infinite; }

/* ── TRUST CARD ── */
.pi-trust-card {
  background: linear-gradient(160deg, #8884d8 0%, #6f6ad9 50%, #82ca9d 100%);
  border-radius: 28px;
  padding: 2.8rem;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  height: fit-content;
}

.pi-trust-card h3 {
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -.8px;
  line-height: 1.2;
}
.pi-trust-card h3 span { color: #dff7e7; }

.pi-trust-card p {
  color: rgba(255,255,255,.85);
  font-size: .95rem;
  line-height: 1.7;
}

.pi-trust-item {
  display: flex;
  align-items: flex-start;
  gap: .9rem;
  padding: 1.1rem;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(10px);
  border-radius: 18px;
}

.pi-trust-icon {
  width: 40px; height: 40px;
  min-width: 40px;
  border-radius: 12px;
  background: rgba(255,255,255,.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pi-trust-text h4 {
  font-size: .92rem;
  font-weight: 700;
  margin-bottom: .2rem;
}
.pi-trust-text p {
  font-size: .82rem;
  color: rgba(255,255,255,.75);
  line-height: 1.5;
}

.pi-trust-quote {
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 18px;
  padding: 1.4rem;
}
.pi-trust-quote p {
  font-style: italic;
  font-size: .9rem;
  margin-bottom: .6rem;
}
.pi-trust-quote cite {
  font-size: .8rem;
  font-style: normal;
  font-weight: 600;
  color: #dff7e7;
}

/* ── FOOTER ── */
.pi-footer {
  background: var(--dark);
  color: rgba(255,255,255,.7);
  padding: 2rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .84rem;
}
.pi-footer span:first-child { font-weight: 600; color: white; }

/* ── LOADING ── */
.pi-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  color: var(--muted);
  font-size: 1rem;
  background: var(--bg);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .pi-nav { padding: 1rem 1.5rem; }
  .pi-hero { padding: 7rem 1.5rem 4rem; }
  .pi-hero h1 { font-size: 2.4rem; }
  .pi-stats-bar { grid-template-columns: 1fr 1fr; padding: 1.8rem; margin: -1.5rem 1rem 0; }
  .pi-section { padding: 4rem 1.5rem; }
  .pi-form-wrap { grid-template-columns: 1fr; }
  .pi-footer { flex-direction: column; gap: .6rem; text-align: center; }
}
`;

// ── Component ──────────────────────────────────────────────────────────────
const PublicImpact = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [form, setForm] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    purpose: '',
    centre_id: '',
  });
  const [paying, setPaying] = useState(false);
  const [activeChip, setActiveChip] = useState(null);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  useEffect(() => {
    api.get('/public/impact').then(res => setStats(res.data)).catch(() => {});
    api.get('/public/schools').then(res => setSchools(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleChip = (val) => {
    setActiveChip(val);
    setForm({ ...form, amount: String(val) });
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!form.donor_name || !form.donor_email || !form.amount) {
      return toast.error('Please fill all required fields.');
    }
    try {
      setPaying(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.post('/public/donate', form);
      toast.success(`Donation successful! Receipt: RCP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
      setForm({ donor_name: '', donor_email: '', amount: '', purpose: '', centre_id: '' });
      setActiveChip(null);
    } catch {
      toast.error('Donation failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (!stats) return <div className="pi-loading">Loading impact data…</div>;

  const statItems = [
    { icon: <IconUsers />, num: stats.total_learners, label: 'Learners Active', color: 'indigo' },
    { icon: <IconCert />,  num: stats.total_certificates, label: 'Certificates Issued', color: 'purple' },
    { icon: <IconSchool />, num: stats.total_schools, label: 'Schools Supported', color: 'green' },
    { icon: <IconTeacher />, num: stats.total_teachers, label: 'Teachers Trained', color: 'orange' },
  ];

  return (
    <>
      {/* NAV */}
      <nav className="pi-nav">
        <div className="pi-nav-logo">MIET <span>Africa</span></div>
        <button className="pi-back-btn" onClick={() => navigate(-1)}>
          <IconArrowLeft /> Back
        </button>
      </nav>

      {/* HERO */}
      <section className="pi-hero">
        <div className="pi-hero-inner">
          <div className="pi-hero-badge">
            <span className="pi-badge-dot" />
            Live Impact Dashboard
          </div>
          <h1>
            Transforming Lives<br />
            <span>Across South Africa</span>
          </h1>
          <p className="pi-hero-body">
            Every contribution directly funds literacy programmes, teacher development,
            and school support across all nine South African provinces. See the real
            difference your donation makes.
          </p>
        </div>
      </section>

      {/* LIVE STATS BAR */}
      <div style={{ background: '#f5f7fb', paddingBottom: '1px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4rem' }}>
          <div className="pi-stats-bar">
            {statItems.map((s) => (
              <div className="pi-stat-item" key={s.label}>
                <div className="pi-stat-icon">{s.icon}</div>
                <div className={`pi-stat-num ${s.color}`}>{s.num?.toLocaleString?.() ?? s.num}</div>
                <div className="pi-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DONATION SECTION */}
      <div style={{ background: '#f5f7fb' }}>
        <div className="pi-section">
          <div className="pi-section-tag">Make a Difference</div>
          <h2 className="pi-section-heading">
            Support education<br />
            <span>that changes lives</span>
          </h2>
          <p className="pi-section-sub">
            Your donation funds bursaries, classroom equipment, teacher training,
            and digital learning resources in under-resourced communities.
          </p>

          <div className="pi-form-wrap">
            {/* FORM CARD */}
            <div className="pi-form-card">
              <h2>Make a Donation</h2>
              <p className="pi-form-sub">All transactions are secured and POPIA-compliant.</p>

              {/* Amount quick-chips */}
              <div className="pi-field">
                <label>Amount (ZAR) *</label>
                <div className="pi-amount-grid">
                  {[100, 250, 500, 1000].map(v => (
                    <button
                      key={v}
                      type="button"
                      className={`pi-amount-chip${activeChip === v ? ' active' : ''}`}
                      onClick={() => handleChip(v)}
                    >
                      R{v.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => { handleChange(e); setActiveChip(null); }}
                  placeholder="Or enter custom amount"
                  min="1"
                  required
                />
              </div>

              <div className="pi-field">
                <label>Your Name *</label>
                <input
                  name="donor_name"
                  value={form.donor_name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="pi-field">
                <label>Email Address *</label>
                <input
                  name="donor_email"
                  type="email"
                  value={form.donor_email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="pi-field">
                <label>Purpose (optional)</label>
                <input
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="e.g. Bursaries, Equipment, Teacher Training"
                />
              </div>

              <div className="pi-field">
                <label>Support a Specific School (optional)</label>
                <select name="centre_id" value={form.centre_id} onChange={handleChange}>
                  <option value="">MIET Africa (General Fund)</option>
                  {schools.map(s => (
                    <option key={s.centre_id} value={s.centre_id}>{s.centre_name}</option>
                  ))}
                </select>
              </div>

              <button
                className="pi-submit-btn"
                disabled={paying}
                onClick={handleDonate}
              >
                {paying ? (
                  <>
                    <IconSpin /> Processing…
                  </>
                ) : (
                  <>
                    Donate Now <IconArrow />
                  </>
                )}
              </button>
            </div>

            {/* TRUST PANEL */}
            <div className="pi-trust-card">
              <h3>
                Why give to<br />
                <span>MIET Africa?</span>
              </h3>
              <p>
                For over 35 years we have been the bridge between resources and the
                classrooms that need them most — with full transparency on every rand spent.
              </p>

              {[
                {
                  icon: <IconSchool />,
                  title: '1 000+ Schools Reached',
                  desc: 'Active programmes across all nine South African provinces and beyond.',
                },
                {
                  icon: <IconUsers />,
                  title: '500K+ Learners Impacted',
                  desc: 'From Foundation Phase literacy to matric support and beyond.',
                },
                {
                  icon: <IconCert />,
                  title: 'Transparent Reporting',
                  desc: 'Every donor receives a receipt and impact update on their contribution.',
                },
              ].map(t => (
                <div className="pi-trust-item" key={t.title}>
                  <div className="pi-trust-icon">{t.icon}</div>
                  <div className="pi-trust-text">
                    <h4>{t.title}</h4>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}

              <div className="pi-trust-quote">
                <p>
                  "MIET Africa has been at the forefront of educational transformation —
                  empowering teachers, strengthening schools, and giving every learner
                  the opportunity to thrive."
                </p>
                <cite>— MIET Africa Mission Statement</cite>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pi-footer">
        <span>© 2026 MIET Africa. All rights reserved.</span>
        <span>POPIA Compliant · Non-Profit Organisation · Est. 1989</span>
      </footer>
    </>
  );
};

export default PublicImpact;