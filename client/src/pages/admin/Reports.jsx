import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [tab, setTab] = useState('impact'); // 'impact', 'learners', 'generate'
  const [impact, setImpact] = useState([]);
  const [learners, setLearners] = useState([]);

  // Report generation
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [quarter, setQuarter] = useState('1');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/reports/impact').then(res => setImpact(res.data)).catch(() => {});
    api.get('/reports/learner-summary').then(res => setLearners(res.data)).catch(() => {});
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'monthly') {
        const { data } = await api.get('/reports/monthly', { params: { year, month } });
        setReportData(data);
      } else {
        const { data } = await api.get('/reports/quarterly', { params: { year, quarter } });
        setReportData(data);
      }
      toast.success('Report generated');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>

      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('impact')} className={`px-4 py-2 rounded ${tab === 'impact' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          Donor Impact
        </button>
        <button onClick={() => setTab('learners')} className={`px-4 py-2 rounded ${tab === 'learners' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          Learner Summary
        </button>
        <button onClick={() => setTab('generate')} className={`px-4 py-2 rounded ${tab === 'generate' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          Generate Custom Report
        </button>
      </div>

      {tab === 'impact' && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learners Trained</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pass Rate %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {impact.slice(0, 50).map((row, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{row.year}</td>
                  <td className="px-6 py-4">{row.month}</td>
                  <td className="px-6 py-4">{row.province_name}</td>
                  <td className="px-6 py-4">{row.learners_trained}</td>
                  <td className="px-6 py-4">{row.pass_rate_percent}%</td>
                  <td className="px-6 py-4">{row.certificates_issued}</td>
                </tr>
              ))}
              {impact.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'learners' && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {learners.map(l => (
                <tr key={l.learner_id}>
                  <td className="px-6 py-4">{l.first_name} {l.last_name}</td>
                  <td className="px-6 py-4">{l.id_number}</td>
                  <td className="px-6 py-4">{l.learner_status}</td>
                  <td className="px-6 py-4">{l.total_enrolments}</td>
                  <td className="px-6 py-4">{l.avg_attendance_percentage}%</td>
                  <td className="px-6 py-4">{l.certificates_issued}</td>
                </tr>
              ))}
              {learners.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No learners yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'generate' && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Generate Impact Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            {reportType === 'monthly' ? (
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <select value={month} onChange={e => setMonth(e.target.value)} className="w-full border rounded px-3 py-2">
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Quarter</label>
                <select value={quarter} onChange={e => setQuarter(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="1">Q1 (Jan-Mar)</option>
                  <option value="2">Q2 (Apr-Jun)</option>
                  <option value="3">Q3 (Jul-Sep)</option>
                  <option value="4">Q4 (Oct-Dec)</option>
                </select>
              </div>
            )}
          </div>
          <button onClick={generateReport} disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          {reportData && (
            <div className="mt-6 p-4 border rounded bg-gray-50" id="report-content">
              <h3 className="text-lg font-bold mb-2">Report Summary</h3>
              <ul className="space-y-2">
                <li><span className="font-medium">Children Assessed:</span> {reportData.children_assessed}</li>
                <li><span className="font-medium">Average Assessment Score:</span> {reportData.avg_assessment_score}%</li>
                <li><span className="font-medium">Passed Count:</span> {reportData.passed_count}</li>
                <li><span className="font-medium">Total Enrolments:</span> {reportData.total_enrolments}</li>
                <li><span className="font-medium">Training Hours Logged:</span> {parseFloat(reportData.training_hours || 0).toFixed(1)} hrs</li>
                <li><span className="font-medium">Approved Resources:</span> {reportData.approved_resources}</li>
              </ul>
              <button onClick={handlePrint} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Print / Save as PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;