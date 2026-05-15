import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SchoolReports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [quarter, setQuarter] = useState('1');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'monthly') {
        const { data } = await api.get('/reports/school/monthly', { params: { year, month } });
        setReportData(data);
      } else {
        const { data } = await api.get('/reports/school/quarterly', { params: { year, quarter } });
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
      <h1 className="text-2xl font-bold mb-4">School Reports</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Generate Report</h2>
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
          {loading ? 'Generating...' : 'Generate'}
        </button>

        {reportData && (
          <div className="mt-6 p-4 border rounded bg-gray-50" id="report-content">
            <h3 className="text-lg font-bold mb-2">School Report</h3>
            <ul className="space-y-2">
              <li><span className="font-medium">Children Assessed:</span> {reportData.children_assessed}</li>
              <li><span className="font-medium">Average Assessment Score:</span> {reportData.avg_assessment_score}%</li>
              <li><span className="font-medium">Passed Count:</span> {reportData.passed_count}</li>
              <li><span className="font-medium">Total Enrolments:</span> {reportData.total_enrolments}</li>
              <li><span className="font-medium">Training Hours:</span> {parseFloat(reportData.training_hours || 0).toFixed(1)} hrs</li>
              <li><span className="font-medium">Approved Resources:</span> {reportData.approved_resources}</li>
            </ul>
            <button onClick={handlePrint} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Print / Save as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolReports;