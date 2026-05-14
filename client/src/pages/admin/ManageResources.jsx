import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageResources = () => {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('LESSON_PLAN');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/resources/admin').then(res => setResources(res.data));

  useEffect(() => { fetch(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('file', file);
    try {
      setLoading(true);
      await api.post('/resources', formData);
      toast.success('Resource uploaded');
      fetch();
      setTitle('');
      setFile(null);
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await api.put(`/resources/${id}/approve`);
    toast.success('Approved');
    fetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this resource?')) {
      await api.delete(`/resources/${id}`);
      toast.success('Deleted');
      fetch();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resource Management</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Upload New Resource</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="LESSON_PLAN">Lesson Plan</option>
            <option value="VIDEO">Video</option>
            <option value="WORKSHEET">Worksheet</option>
            <option value="GUIDE">Guide</option>
          </select>
          <input type="file" onChange={e => setFile(e.target.files[0])} className="block" required />
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {resources.map(r => (
            <li key={r.resource_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-gray-500">{r.type} {!r.is_approved && '(Pending)'}</p>
              </div>
              <div className="flex space-x-2">
                {!r.is_approved && (
                  <button onClick={() => handleApprove(r.resource_id)} className="text-green-600 hover:underline">Approve</button>
                )}
                <button onClick={() => handleDelete(r.resource_id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageResources;