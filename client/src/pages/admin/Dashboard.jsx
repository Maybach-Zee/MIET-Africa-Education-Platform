import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [provinceStats, setProvinceStats] = useState([]);
  const [monthlyRegs, setMonthlyRegs] = useState([]);
  const [courseStats, setCourseStats] = useState([]);

  useEffect(() => {
    api.get('/dashboard/summary').then(res => setSummary(res.data));
    api.get('/dashboard/province-stats').then(res => setProvinceStats(res.data));
    api.get('/dashboard/monthly-registrations').then(res => setMonthlyRegs(res.data));
    api.get('/dashboard/course-stats').then(res => setCourseStats(res.data));
  }, []);

  const exportCSV = () => {
    // Convert summary to CSV
    if (!summary) return;
    const rows = Object.entries(summary).map(([k, v]) => `${k},${v}`).join('\n');
    const blob = new Blob([`metric,value\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard_summary.csv';
    a.click();
    toast.success('CSV exported');
  };

  const exportPDF = () => {
    // Placeholder: could use jsPDF or window.print
    window.print();
    toast.success('Printed / PDF saved via browser');
  };

  if (!summary) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <div className="flex space-x-2">
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export CSV</button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Export PDF</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(summary).map(([key, val]) => (
          <div key={key} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate capitalize">{key.replace(/_/g, ' ')}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{val}</dd>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Active Learners by Province</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={provinceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="province_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="active_learners" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Learner Registrations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRegs.slice(0,12)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="new_registrations" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Course Completion Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course_code" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completion_rate_percent" fill="#ffc658" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Certificates Issued per Course</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={courseStats} dataKey="certificates_issued" nameKey="course_code" cx="50%" cy="50%" outerRadius={100} label>
                {courseStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Downloads / Training Completion Placeholders – we can add simple cards with mock data if not in API yet */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Literacy Improvement & Training Completion</h2>
        <p className="text-gray-500">Feature coming soon – will show literacy improvement rates and teacher training completion once mobile app data syncs.</p>
      </div>
    </div>
  );
};

export default Dashboard;