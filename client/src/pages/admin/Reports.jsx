import { useEffect, useState } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [tab, setTab] = useState('impact');
  const [impact, setImpact] = useState([]);
  const [learners, setLearners] = useState([]);

  useEffect(() => {
    api.get('/reports/impact').then(res => setImpact(res.data));
    api.get('/reports/learner-summary').then(res => setLearners(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
      <div className="flex space-x-4 mb-6">
        {['impact', 'learners'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded ${tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
            {t === 'impact' ? 'Donor Impact' : 'Learner Summary'}
          </button>
        ))}
      </div>

      {tab === 'impact' && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Year</th><th>Month</th><th>Province</th><th>Learners Trained</th><th>Pass Rate %</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {impact.slice(0,50).map((row, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{row.year}</td><td className="px-6 py-4">{row.month}</td><td className="px-6 py-4">{row.province_name}</td>
                  <td className="px-6 py-4">{row.learners_trained}</td><td className="px-6 py-4">{row.pass_rate_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'learners' && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3">Name</th><th>ID</th><th>Status</th><th>Enrolments</th><th>Avg Attend.</th><th>Certificates</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {learners.map(l => (
                <tr key={l.learner_id}>
                  <td className="px-6 py-4">{l.first_name} {l.last_name}</td><td className="px-6 py-4">{l.id_number}</td>
                  <td className="px-6 py-4">{l.learner_status}</td><td className="px-6 py-4">{l.total_enrolments}</td>
                  <td className="px-6 py-4">{l.avg_attendance_percentage}%</td><td className="px-6 py-4">{l.certificates_issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;