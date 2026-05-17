import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [provinceStats, setProvinceStats] = useState([]);
  const [schoolSummary, setSchoolSummary] = useState([]);

  useEffect(() => {
    api.get('/dashboard/admin-stats').then(res => setStats(res.data));
    api.get('/dashboard/province-stats').then(res => setProvinceStats(res.data));
    api.get('/dashboard/school-summary').then(res => setSchoolSummary(res.data));
  }, []);

  const exportCSV = () => {
    if (!stats) return;
    const rows = Object.entries(stats)
      .map(([k, v]) => `${k.replace(/_/g, ' ')},${v}`)
      .join('\n');
    const blob = new Blob([`metric,value\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard_summary.csv';
    a.click();
    toast.success('CSV exported');
  };

  const exportPDF = () => {
    window.print();
    toast.success('Printed / PDF saved');
  };

  if (!stats) return <div className="text-center py-10">Loading dashboard...</div>;

  const cards = [
    { label: 'Active Schools', value: stats.total_schools, color: 'bg-blue-100 text-blue-700' },
    { label: 'Active Teachers', value: stats.total_teachers, color: 'bg-indigo-100 text-indigo-700' },
    { label: 'Active Learners', value: stats.total_learners, color: 'bg-green-100 text-green-700' },
    { label: 'Approved Resources', value: stats.total_resources, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export CSV</button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Export PDF</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className={`rounded-lg shadow p-6 ${card.color}`}>
            <p className="text-sm font-medium">{card.label}</p>
            <p className="mt-2 text-4xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Province Chart */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
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

      {/* Schools Overview Table */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Schools Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learners</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schoolSummary.map(school => (
                <tr key={school.centre_id}>
                  <td className="px-6 py-4 font-medium">{school.centre_name}</td>
                  <td className="px-6 py-4">{school.province_name}</td>
                  <td className="px-6 py-4">{school.total_teachers}</td>
                  <td className="px-6 py-4">{school.total_learners}</td>
                  <td className="px-6 py-4">{school.active_courses}</td>
                </tr>
              ))}
              {schoolSummary.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No schools found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;