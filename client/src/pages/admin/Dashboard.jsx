import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [provinceStats, setProvinceStats] = useState([]);

  useEffect(() => {
    api.get('/dashboard/summary').then(res => setSummary(res.data));
    api.get('/dashboard/province-stats').then(res => setProvinceStats(res.data));
  }, []);

  if (!summary) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Executive Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.entries(summary).map(([key, val]) => (
          <div key={key} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate capitalize">{key.replace(/_/g, ' ')}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{val}</dd>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Province Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={provinceStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="province_name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="active_learners" fill="#8884d8" name="Active Learners" />
            <Bar dataKey="certificates_issued" fill="#82ca9d" name="Certificates Issued" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;