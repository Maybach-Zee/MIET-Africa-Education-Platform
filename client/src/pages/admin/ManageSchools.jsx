import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageSchools = () => {
  const [centres, setCentres] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [filterProvince, setFilterProvince] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinLearners, setFilterMinLearners] = useState('');

  const fetchCentres = () => {
    const params = {};
    if (filterProvince) params.province_id = filterProvince;
    if (filterStatus) params.status = filterStatus;
    if (filterMinLearners) params.min_learners = filterMinLearners;
    api.get('/centres', { params })
      .then(res => setCentres(res.data))
      .catch(() => toast.error('Failed to load schools'));
  };

  useEffect(() => {
    api.get('/provinces').then(res => setProvinces(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchCentres();
  }, [filterProvince, filterStatus, filterMinLearners]);

  // Toggle active status
  const toggleActive = async (id) => {
    await api.put(`/centres/${id}/toggle-active`);
    toast.success('Status toggled');
    fetchCentres();
  };

  // Update registration status (approve / reject / pending)
  const updateRegistrationStatus = async (id, newStatus) => {
    await api.put(`/centres/${id}/update-status`, { registration_status: newStatus });
    toast.success(`School ${newStatus.toLowerCase()}`);
    fetchCentres();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">School Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded shadow">
        <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Provinces</option>
          {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input type="number" placeholder="Min enrolled learners" value={filterMinLearners}
          onChange={e => setFilterMinLearners(e.target.value)} className="border rounded px-3 py-2" min="0" />
      </div>

      {/* School Directory */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {centres.map(c => (
              <tr key={c.centre_id}>
                <td className="px-6 py-4 font-medium">{c.centre_name} <span className="text-gray-500">({c.centre_code})</span></td>
                <td className="px-6 py-4">{c.province_name}</td>
                <td className="px-6 py-4">{c.city}</td>
                <td className="px-6 py-4">{c.enrolled_learners || 0}</td>
                <td className="px-6 py-4">{c.manager_name || 'Unassigned'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    c.registration_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    c.registration_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {c.registration_status}
                  </span>
                  {c.rejection_comment && <p className="text-xs text-red-500 mt-1">{c.rejection_comment}</p>}
                </td>
                <td className="px-6 py-4">
                  <span className={c.is_active ? 'text-green-600' : 'text-red-600'}>
                    {c.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleActive(c.centre_id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    {c.registration_status !== 'APPROVED' && (
                      <button
                        onClick={() => updateRegistrationStatus(c.centre_id, 'APPROVED')}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {c.registration_status !== 'REJECTED' && (
                      <button
                        onClick={() => updateRegistrationStatus(c.centre_id, 'REJECTED')}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Reject
                      </button>
                    )}
                    {c.registration_status !== 'PENDING' && (
                      <button
                        onClick={() => updateRegistrationStatus(c.centre_id, 'PENDING')}
                        className="text-yellow-600 hover:underline text-sm"
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSchools;