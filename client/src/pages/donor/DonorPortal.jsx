// Donations.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Icons ──────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const IconDollar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconRefund = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const IconWaive = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
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
  --danger: #dc2626;
}

/* ── SHELL ── */
.don-shell {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 2rem;
}

/* ── BACK BUTTON ── */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: .55rem 1.1rem;
  font-size: .85rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: .2s ease;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 1.8rem;
}

.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateX(-2px);
}

/* ── HEADER ── */
.don-header {
  margin-bottom: 1.5rem;
}

.don-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: -1px;
}

.don-header p {
  color: var(--muted);
  font-size: .9rem;
  margin-top: .3rem;
}

/* ── STAT CARDS ── */
.don-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.don-stat {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  padding: 1.4rem 1.5rem;
  transition: .2s ease;
}

.don-stat:first-child {
  background: linear-gradient(135deg, #8884d8, #82ca9d);
  border-color: transparent;
}

.don-stat:first-child .ds-label,
.don-stat:first-child .ds-value {
  color: white;
}

.don-stat:first-child .ds-icon {
  background: rgba(255,255,255,.2);
  color: white;
}

.don-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(136,132,216,.1);
}

.ds-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .8rem;
}

.ds-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(136,132,216,.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.ds-label {
  font-size: .78rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .4px;
}

.ds-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: -1px;
  line-height: 1;
}

.ds-sub {
  margin-top: .3rem;
  font-size: .78rem;
  color: var(--muted);
}

/* ── TOOLBAR ── */
.don-toolbar {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  padding: 1rem 1.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: .8rem;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: .9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
}

.search-input {
  height: 42px;
  width: 240px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0 1rem 0 2.5rem;
  font-size: .88rem;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  transition: .2s;
  color: var(--dark);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(136,132,216,.12);
}

.filter-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: .9rem;
  color: var(--muted);
  pointer-events: none;
}

.filter-chevron {
  position: absolute;
  right: .9rem;
  color: var(--muted);
  pointer-events: none;
}

.filter-select {
  height: 42px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0 2.4rem 0 2.5rem;
  font-size: .88rem;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  appearance: none;
  background: white;
  color: var(--dark);
  cursor: pointer;
  transition: .2s;
  min-width: 160px;
}

.filter-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(136,132,216,.12);
}

.toolbar-right {
  font-size: .85rem;
  color: var(--muted);
}

.toolbar-right strong {
  color: var(--dark);
}

/* ── TABLE CARD ── */
.don-table-card {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 24px;
  overflow: hidden;
}

.don-table {
  width: 100%;
  border-collapse: collapse;
}

.don-table thead tr {
  background: #f8fafc;
  border-bottom: 1.5px solid var(--border);
}

.don-table th {
  padding: .9rem 1.4rem;
  text-align: left;
  font-size: .74rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .5px;
  white-space: nowrap;
}

.don-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background .15s;
}

.don-table tbody tr:last-child {
  border-bottom: none;
}

.don-table tbody tr:hover {
  background: #fafbff;
}

.don-table td {
  padding: 1rem 1.4rem;
  font-size: .88rem;
  color: var(--dark);
  vertical-align: middle;
}

/* ── DONOR CELL ── */
.donor-cell {
  display: flex;
  align-items: center;
  gap: .8rem;
}

.donor-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(136,132,216,.2), rgba(130,202,157,.2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .82rem;
  font-weight: 700;
  color: var(--primary);
  flex-shrink: 0;
}

.donor-name {
  font-weight: 600;
  color: var(--dark);
  font-size: .88rem;
}

/* ── AMOUNT ── */
.amount-cell {
  font-weight: 700;
  color: var(--dark);
}

.amount-cell .currency {
  font-size: .75rem;
  font-weight: 600;
  color: var(--muted);
  margin-right: .1rem;
}

/* ── PURPOSE PILL ── */
.purpose-pill {
  display: inline-block;
  background: #f1f5f9;
  color: var(--muted);
  border-radius: 8px;
  padding: .25rem .7rem;
  font-size: .78rem;
  font-weight: 600;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── STATUS BADGES ── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .3rem .8rem;
  border-radius: 100px;
  font-size: .76rem;
  font-weight: 700;
}

.status-badge.paid {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.pending {
  background: #fef9c3;
  color: #a16207;
}

.status-badge.waived {
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.refunded {
  background: #fee2e2;
  color: var(--danger);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* ── ACTION BUTTONS ── */
.action-cell {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.act-btn {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  height: 32px;
  padding: 0 .8rem;
  border-radius: 8px;
  font-size: .78rem;
  font-weight: 700;
  border: 1.5px solid;
  cursor: pointer;
  transition: .2s ease;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap;
}

.act-btn.pay {
  color: #16a34a;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.act-btn.pay:hover {
  background: #dcfce7;
  border-color: #16a34a;
}

.act-btn.waive {
  color: #64748b;
  border-color: #e2e8f0;
  background: #f8fafc;
}

.act-btn.waive:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.act-btn.refund {
  color: var(--danger);
  border-color: #fecaca;
  background: #fff5f5;
}

.act-btn.refund:hover {
  background: #fee2e2;
  border-color: var(--danger);
}

/* ── EMPTY STATE ── */
.don-empty {
  padding: 5rem 2rem;
  text-align: center;
  color: var(--muted);
}

.don-empty p {
  font-size: .95rem;
}

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .don-stats { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .don-shell { padding: 1rem; }
  .don-stats { grid-template-columns: 1fr 1fr; }
  .don-table-card { overflow-x: auto; }
  .search-input { width: 180px; }
}

@media (max-width: 480px) {
  .don-stats { grid-template-columns: 1fr; }
}
`;

// ── HELPERS ───────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const statusClass = (s) => ({
  PAID: 'paid',
  PENDING: 'pending',
  WAIVED: 'waived',
  REFUNDED: 'refunded',
}[s] || 'pending');

// ── COMPONENT ─────────────────────────────────────────────────────────────
const Donations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchDonations = () => {
    api.get('/donations')
      .then(res => {
        setDonations(res.data);
        const sum = res.data.reduce((acc, d) => acc + parseFloat(d.amount), 0);
        setTotal(sum);
      })
      .catch(() => toast.error('Failed to load donations'));
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleProcess = async (id, status) => {
    try {
      await api.put(`/donations/${id}/process`, { payment_status: status });
      toast.success('Donation status updated');
      fetchDonations();
    } catch {
      toast.error('Update failed. Please try again.');
    }
  };

  const filtered = donations.filter(d => {
    const matchStatus = !statusFilter || d.payment_status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.donor_name?.toLowerCase().includes(q) ||
      d.donor_email?.toLowerCase().includes(q) ||
      d.purpose?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const paidTotal   = donations.filter(d => d.payment_status === 'PAID').reduce((a, d) => a + parseFloat(d.amount), 0);
  const pendingCount = donations.filter(d => d.payment_status === 'PENDING').length;

  return (
    <>
      <style>{css}</style>

      <div className="don-shell">

        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate('/')}>
          <IconArrowLeft /> Back to Home
        </button>

        {/* Header */}
        <div className="don-header">
          <h1>Donations</h1>
          <p>Track, manage and process all donation records across programmes</p>
        </div>

        {/* Stat Cards */}
        <div className="don-stats">
          <div className="don-stat">
            <div className="ds-top">
              <div className="ds-icon"><IconDollar /></div>
              <span className="ds-label">Total</span>
            </div>
            <div className="ds-value">R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
            <div className="ds-sub">All donations combined</div>
          </div>

          <div className="don-stat">
            <div className="ds-top">
              <div className="ds-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span className="ds-label">Paid</span>
            </div>
            <div className="ds-value">R {paidTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
            <div className="ds-sub">Confirmed payments</div>
          </div>

          <div className="don-stat">
            <div className="ds-top">
              <div className="ds-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className="ds-label">Pending</span>
            </div>
            <div className="ds-value">{pendingCount}</div>
            <div className="ds-sub">Awaiting processing</div>
          </div>

          <div className="don-stat">
            <div className="ds-top">
              <div className="ds-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="ds-label">Donors</span>
            </div>
            <div className="ds-value">{new Set(donations.map(d => d.donor_email)).size}</div>
            <div className="ds-sub">Unique donors</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="don-toolbar">
          <div className="toolbar-left">
            <div className="search-wrap">
              <span className="search-icon"><IconSearch /></span>
              <input
                className="search-input"
                placeholder="Search donor or purpose…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-select-wrap">
              <span className="filter-icon"><IconFilter /></span>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="WAIVED">Waived</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <span className="filter-chevron"><IconChevronDown /></span>
            </div>
          </div>

          <div className="toolbar-right">
            Showing <strong>{filtered.length}</strong> of <strong>{donations.length}</strong> records
          </div>
        </div>

        {/* Table */}
        <div className="don-table-card">
          <table className="don-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="don-empty">
                      <p>No donations match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(d => (
                <tr key={d.donation_id}>
                  <td>
                    <div className="donor-cell">
                      <div className="donor-avatar">{getInitials(d.donor_name)}</div>
                      <span className="donor-name">{d.donor_name}</span>
                    </div>
                  </td>

                  <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
                    {d.donor_email}
                  </td>

                  <td>
                    <span className="amount-cell">
                      <span className="currency">R</span>
                      {parseFloat(d.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  <td>
                    <span className="purpose-pill">{d.purpose || '—'}</span>
                  </td>

                  <td>
                    <span className={`status-badge ${statusClass(d.payment_status)}`}>
                      <span className="status-dot" />
                      {d.payment_status}
                    </span>
                  </td>

                  <td>
                    <div className="action-cell">
                      {d.payment_status === 'PENDING' && (
                        <>
                          <button
                            className="act-btn pay"
                            onClick={() => handleProcess(d.donation_id, 'PAID')}
                          >
                            <IconCheck /> Mark Paid
                          </button>
                          <button
                            className="act-btn waive"
                            onClick={() => handleProcess(d.donation_id, 'WAIVED')}
                          >
                            <IconWaive /> Waive
                          </button>
                        </>
                      )}
                      {d.payment_status !== 'REFUNDED' && (
                        <button
                          className="act-btn refund"
                          onClick={() => handleProcess(d.donation_id, 'REFUNDED')}
                        >
                          <IconRefund /> Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
};

export default Donations;