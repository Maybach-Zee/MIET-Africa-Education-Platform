import { useEffect, useState } from 'react';
import api from '../../services/api';

const PublicImpact = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/impact').then(res => {
      const data = res.data;
      if (data.length > 0) {
        const totalLearners = data.reduce((s, r) => s + Number(r.learners_trained), 0);
        const totalCertificates = data.reduce((s, r) => s + Number(r.certificates_issued), 0);
        setStats({ totalLearners, totalCertificates });
      } else {
        setStats({ totalLearners: 0, totalCertificates: 0 });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">MIET Africa Impact</h1>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 text-lg">Learners Trained</p>
            <p className="text-6xl font-bold text-indigo-600">{stats.totalLearners}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 text-lg">Certificates Issued</p>
            <p className="text-6xl font-bold text-purple-600">{stats.totalCertificates}</p>
          </div>
        </div>
      )}
      <div className="mt-12 max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Volunteer With Us</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full border rounded px-3 py-2" required />
          <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2" required />
          <textarea placeholder="Why do you want to volunteer?" className="w-full border rounded px-3 py-2" rows="3" />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Submit Interest</button>
        </form>
      </div>
    </div>
  );
};

export default PublicImpact;