import { useEffect, useState } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('impact');
  const [impact, setImpact] = useState([]);
  const [learnerSummary, setLearnerSummary] = useState([]);

  useEffect(() => {
    api.get('/reports/impact').then(res => setImpact(res.data));
    api.get('/reports/learner-summary').then(res => setLearnerSummary(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Impact & Analytics Reports</h1>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab('impact')} className={`px-4 py-2 rounded ${activeTab === 'impact' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          Donor Impact
        </button>
        <button onClick={() => setActiveTab('learners')} className={`px-4 py-2 rounded ${activeTab === 'learners' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          Learner Summary
        </button>
      </div>
      {activeTab === 'impact' && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th><th>Month</th><th>Province</th><th>Learners Trained</th><th>Pass Rate %</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {impact.slice(0, 50).map((row, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4">{row.year}</td>
                  <td className="px-6 py-4">{row.month}</td>
                  <td className="px-6 py-4">{row.province_name}</td>
                  <td className="px-6 py-4">{row.learners_trained}</td>
                  <td className="px-6 py-4">{row.pass_rate_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'learners' && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3">Name</th><th>ID Number</th><th>Status</th><th>Enrolments</th><th>Avg Attendance</th><th>Certificates</th></tr></thead>
            <tbody>
              {learnerSummary.map(l => (
                <tr key={l.learner_id}>
                  <td className="px-6 py-4">{l.first_name} {l.last_name}</td>
                  <td className="px-6 py-4">{l.id_number}</td>
                  <td className="px-6 py-4">{l.learner_status}</td>
                  <td className="px-6 py-4">{l.total_enrolments}</td>
                  <td className="px-6 py-4">{l.avg_attendance_percentage}%</td>
                  <td className="px-6 py-4">{l.certificates_issued}</td>
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