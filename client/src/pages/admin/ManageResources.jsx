import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageResources = () => {
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    if (tab === 'summary') {
      api.get('/resources/summary').then(res => setSummary(res.data)).catch(() => toast.error('Failed to load summary'));
    } else {
      api.get('/resources/admin').then(res => setResources(res.data)).catch(() => toast.error('Failed to load resources'));
    }
  }, [tab]);

  const handleApprove = async (id) => {
    await api.put(`/resources/${id}/approve`);
    toast.success('Approved');
    api.get('/resources/admin').then(res => setResources(res.data));
  };

  const handleArchive = async (id) => {
    if (window.confirm('Archive?')) {
      await api.put(`/resources/${id}/archive`);
      toast.success('Archived');
      api.get('/resources/admin').then(res => setResources(res.data));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      await api.delete(`/resources/${id}`);
      toast.success('Deleted');
      api.get('/resources/admin').then(res => setResources(res.data));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resources</h1>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('summary')} className={`px-4 py-2 rounded ${tab === 'summary' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          School Summary
        </button>
        <button onClick={() => setTab('manage')} className={`px-4 py-2 rounded ${tab === 'manage' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
          Manage All Resources
        </button>
      </div>

      {tab === 'summary' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Resources</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.map(row => (
                <tr key={row.centre_id}>
                  <td className="px-6 py-4">{row.centre_name}</td>
                  <td className="px-6 py-4">{row.total_resources}</td>
                  <td className="px-6 py-4">{row.approved_resources}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'manage' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {resources.map(r => (
              <li key={r.resource_id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.type} | {r.is_approved ? 'Approved' : 'Pending'} {!r.is_active && '| Archived'}</p>
                </div>
                <div className="flex gap-1">
  {!r.is_approved && <button onClick={() => handleApprove(r.resource_id)} className="text-green-600 hover:underline text-sm">Approve</button>}
  <button onClick={() => handleArchive(r.resource_id)} className="text-yellow-600 hover:underline text-sm">Archive</button>
  <button onClick={() => handleDelete(r.resource_id)} className="text-red-600 hover:underline text-sm">Delete</button>
</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ManageResources;