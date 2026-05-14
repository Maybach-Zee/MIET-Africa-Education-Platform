import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [tab, setTab] = useState('impact');
  const [impact, setImpact] = useState([]);
  const [learners, setLearners] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [quarter, setQuarter] = useState('Q1');

  useEffect(() => {
    api.get('/reports/impact').then(res => setImpact(res.data));
    api.get('/reports/learner-summary').then(res => setLearners(res.data));
  }, []);

  const generateMonthlyReport = () => {
    // Just filter existing impact data for now
    const [year, mon] = month.split('-');
    const filtered = impact.filter(i => i.year == year && i.month == mon);
    if (filtered.length === 0) return toast.error('No data for selected month');
    // Could build PDF using jsPDF or print
    window.print();
  };

  const generateQuarterlyReport = () => {
    // Similar logic
    window.print();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>

      <div className="flex space-x-4 mb-6">
        {['impact', 'learners', 'generate'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded ${tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
            {t === 'impact' ? 'Donor Impact' : t === 'learners' ? 'Learner Summary' : 'Generate Report'}
          </button>
        ))}
      </div>

      {tab === 'impact' && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3">Year</th><th>Month</th><th>Province</th><th>Learners Trained</th><th>Pass Rate %</th><th>Certificates</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {impact.slice(0,50).map((row, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{row.year}</td><td className="px-6 py-4">{row.month}</td><td className="px-6 py-4">{row.province_name}</td>
                  <td className="px-6 py-4">{row.learners_trained}</td><td className="px-6 py-4">{row.pass_rate_percent}%</td>
                  <td className="px-6 py-4">{row.certificates_issued}</td>
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

      {tab === 'generate' && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Generate Custom Report</h2>
          <div className="flex items-end space-x-4 mb-4">
            <div>
              <label className="block text-sm font-medium">Select Month</label>
              <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border rounded px-3 py-2" />
            </div>
            <button onClick={generateMonthlyReport} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Generate Monthly PDF</button>
          </div>
          <div className="flex items-end space-x-4">
            <div>
              <label className="block text-sm font-medium">Quarter</label>
              <select value={quarter} onChange={e => setQuarter(e.target.value)} className="border rounded px-3 py-2">
                <option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option>
              </select>
            </div>
            <button onClick={generateQuarterlyReport} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Generate Quarterly PDF</button>
          </div>
          <p className="mt-4 text-sm text-gray-500">Use browser's Print/Save as PDF to export reports.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;