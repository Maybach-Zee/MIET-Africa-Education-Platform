import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [impact, setImpact] = useState([]);
  const [learnerSummary, setLearnerSummary] = useState([]);
  const [schoolSummary, setSchoolSummary] = useState([]);
  const [courseStats, setCourseStats] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    if (tab === 'overview') {
      api.get('/dashboard/admin-stats').then(res => setOverview(res.data)).catch(() => toast.error('Failed to load overview'));
    } else if (tab === 'impact') {
      api.get('/reports/impact').then(res => setImpact(res.data)).catch(() => toast.error('Failed to load impact data'));
    } else if (tab === 'learners') {
      api.get('/reports/learner-summary')
        .then(res => setLearnerSummary(res.data))
        .catch(() => toast.error('Failed to load learner summary'));
    } else if (tab === 'schools') {
      api.get('/dashboard/school-summary').then(res => setSchoolSummary(res.data)).catch(() => toast.error('Failed to load school summary'));
    } else if (tab === 'courses') {
      api.get('/dashboard/course-stats').then(res => setCourseStats(res.data)).catch(() => toast.error('Failed to load course stats'));
    }
    else if (tab === 'impact') {
      api.get('/donations').then(res => setDonations(res.data)).catch(() => toast.error('Failed to load donations'));
    }
  }, [tab]);

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'impact', label: 'Donor Impact' },
    { key: 'learners', label: 'Learner Summary' },
    { key: 'schools', label: 'School Overview' },
    { key: 'courses', label: 'Course Statistics' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded text-sm font-medium ${tab === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && overview && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">High‑Level Overview</h2>
            <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded"><p className="text-sm text-gray-500">Active Schools</p><p className="text-2xl font-bold">{overview.total_schools}</p></div>
            <div className="bg-indigo-50 p-4 rounded"><p className="text-sm text-gray-500">Teachers</p><p className="text-2xl font-bold">{overview.total_teachers}</p></div>
            <div className="bg-green-50 p-4 rounded"><p className="text-sm text-gray-500">Learners</p><p className="text-2xl font-bold">{overview.total_learners}</p></div>
            <div className="bg-purple-50 p-4 rounded"><p className="text-sm text-gray-500">Approved Resources</p><p className="text-2xl font-bold">{overview.total_resources}</p></div>
          </div>
        </div>
      )}

      {tab === 'impact' && (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-semibold">Donor Impact – All Donations</h2>
      <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF</button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">Donor Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Amount</th>
            <th className="px-6 py-3 text-left">Purpose</th>
            <th className="px-6 py-3 text-left">School</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {donations.map(d => (
            <tr key={d.donation_id}>
              <td className="px-6 py-4">{d.donor_name}</td>
              <td className="px-6 py-4">{d.donor_email}</td>
              <td className="px-6 py-4">R {d.amount}</td>
              <td className="px-6 py-4">{d.purpose}</td>
              <td className="px-6 py-4">{d.centre_name || 'MIET Africa'}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  d.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {d.payment_status}
                </span>
              </td>
              <td className="px-6 py-4">{d.donation_date}</td>
            </tr>
          ))}
          {donations.length === 0 && (
            <tr><td colSpan="7" className="text-center py-4 text-gray-500">No donations recorded yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

{tab === 'learners' && (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-semibold">Learner Summary</h2>
      <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF</button>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">ID Number</th>
            <th className="px-6 py-3 text-left">School</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Enrolments</th>
            <th className="px-6 py-3 text-left">Avg Attendance</th>
            <th className="px-6 py-3 text-left">Certificates</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {learnerSummary.map(l => (
            <tr key={l.learner_id}>
              <td className="px-6 py-4">{l.first_name} {l.last_name}</td>
              <td className="px-6 py-4">{l.id_number}</td>
              <td className="px-6 py-4">{l.centre_name || '–'}</td>
              <td className="px-6 py-4">{l.learner_status}</td>
              <td className="px-6 py-4">{l.total_enrolments}</td>
              <td className="px-6 py-4">{l.avg_attendance_percentage}%</td>
              <td className="px-6 py-4">{l.certificates_issued}</td>
            </tr>
          ))}
          {learnerSummary.length === 0 && (
            <tr><td colSpan="7" className="text-center py-4 text-gray-500">No learner data found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

      {tab === 'schools' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">School Overview</h2>
            <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">School</th>
                  <th className="px-6 py-3 text-left">Province</th>
                  <th className="px-6 py-3 text-left">Teachers</th>
                  <th className="px-6 py-3 text-left">Learners</th>
                  <th className="px-6 py-3 text-left">Active Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schoolSummary.map(s => (
                  <tr key={s.centre_id}>
                    <td className="px-6 py-4 font-medium">{s.centre_name}</td>
                    <td className="px-6 py-4">{s.province_name}</td>
                    <td className="px-6 py-4">{s.total_teachers}</td>
                    <td className="px-6 py-4">{s.total_learners}</td>
                    <td className="px-6 py-4">{s.active_courses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Course Statistics</h2>
            <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Course</th>
                  <th className="px-6 py-3 text-left">School</th>
                  <th className="px-6 py-3 text-left">Enrolments</th>
                  <th className="px-6 py-3 text-left">Completion %</th>
                  <th className="px-6 py-3 text-left">Certificates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courseStats.map(c => (
                  <tr key={c.course_id}>
                    <td className="px-6 py-4">{c.course_title}</td>
                    <td className="px-6 py-4">{c.centre_name || '–'}</td>
                    <td className="px-6 py-4">{c.total_enrolments}</td>
                    <td className="px-6 py-4">{c.completion_rate_percent}%</td>
                    <td className="px-6 py-4">{c.certificates_issued}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;