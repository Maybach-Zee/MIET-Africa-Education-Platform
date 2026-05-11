// client/src/pages/donor/DonorPortal.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';

const DonorPortal = () => {
  const [impact, setImpact] = useState([]);
  useEffect(() => { api.get('/reports/impact').then(res => setImpact(res.data)); }, []);
  // Summarize key stats
  const totalLearners = impact.reduce((sum, r) => sum + Number(r.learners_trained), 0);
  const totalCompleted = impact.reduce((sum, r) => sum + Number(r.learners_completed || 0), 0);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Impact at a Glance</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow"><p className="text-gray-500">Total Learners Trained</p><p className="text-4xl font-bold">{totalLearners}</p></div>
        <div className="bg-white p-6 rounded shadow"><p className="text-gray-500">Completed Courses</p><p className="text-4xl font-bold">{totalCompleted}</p></div>
      </div>
      {/* etc. */}
    </div>
  );
};
export default DonorPortal;