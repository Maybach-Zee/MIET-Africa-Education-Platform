import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [centre, setCentre] = useState(null);
  const [learners, setLearners] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch the centre managed by this user
      api.get('/centres/manager/me').then(res => {
        setCentre(res.data);
        if (res.data) {
          // Fetch learners from this centre
          api.get(`/learners?centre_id=${res.data.centre_id}`).then(lr => setLearners(lr.data));
        }
      }).catch(() => {});
    }
  }, [user]);

  if (!centre) return <div>Loading school data...</div>;

  // Simple literacy progress display (would need actual assessment data)
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{centre.centre_name} – Principal Dashboard</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">School Literacy Progress</h2>
        <p className="text-gray-500">Coming soon: literacy assessment trends, teacher training completion.</p>
        {/* Could list learners with their last assessment scores */}
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Enrolled Learners ({learners.length})</h2>
        <ul>
          {learners.map(l => (
            <li key={l.learner_id} className="py-2 border-b">{l.first_name} {l.last_name} – {l.status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PrincipalDashboard;