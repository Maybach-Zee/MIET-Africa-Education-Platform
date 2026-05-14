import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageSchools = () => {
  const [centres, setCentres] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterProvince, setFilterProvince] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [form, setForm] = useState({
    centre_name: '', province_id: '', address: '', city: '', postal_code: '',
    phone_number: '', email: '', gps_lat: '', gps_lon: '', enrolled_learners: ''
  });
  const [rejectId, setRejectId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    api.get('/centres').then(res => {
      setCentres(res.data);
      setFiltered(res.data);
    });
    // Fetch provinces for dropdown
    api.get('/provinces').then(res => setProvinces(res.data));
  }, []);

  useEffect(() => {
    let data = centres;
    if (filterProvince) data = data.filter(c => c.province_id === filterProvince);
    if (filterStatus === 'active') data = data.filter(c => c.is_active);
    if (filterStatus === 'pending') data = data.filter(c => !c.is_active);
    setFiltered(data);
  }, [filterProvince, filterStatus, centres]);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const register = async (e) => {
    e.preventDefault();
    try {
      await api.post('/centres/register', form);
      toast.success('School registered');
      const { data } = await api.get('/centres');
      setCentres(data);
      setForm({ centre_name: '', province_id: '', address: '', city: '', postal_code: '', phone_number: '', email: '', gps_lat: '', gps_lon: '', enrolled_learners: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const approve = async (id) => {
    await api.put(`/centres/${id}/approve`);
    toast.success('Approved');
    const { data } = await api.get('/centres');
    setCentres(data);
  };

  const openReject = (id) => { setRejectId(id); setRejectComment(''); };
  const confirmReject = async () => {
    if (!rejectId) return;
    await api.put(`/centres/${rejectId}/reject`, { comment: rejectComment });
    toast.success('Rejected');
    setRejectId(null);
    const { data } = await api.get('/centres');
    setCentres(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">School Management</h1>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Provinces</option>
          {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Registration Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Register New School</h2>
        <form onSubmit={register} className="grid grid-cols-2 gap-4">
          <input name="centre_name" placeholder="School Name" value={form.centre_name} onChange={handleChange} className="border rounded px-3 py-2" required />
          <select name="province_id" value={form.province_id} onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Select Province</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
          </select>
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="phone_number" placeholder="Phone" value={form.phone_number} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="gps_lat" placeholder="GPS Latitude" value={form.gps_lat} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="gps_lon" placeholder="GPS Longitude" value={form.gps_lon} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="enrolled_learners" type="number" placeholder="Number of enrolled learners" value={form.enrolled_learners} onChange={handleChange} className="border rounded px-3 py-2" />
          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Register School</button>
        </form>
      </div>

      {/* School List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filtered.map(c => (
            <li key={c.centre_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{c.centre_name} ({c.centre_code})</p>
                <p className="text-sm text-gray-500">
                  {c.province_name} – {c.city} | {c.is_active ? 'Active' : 'Pending'}
                  {c.gps_lat && ` | GPS: ${c.gps_lat},${c.gps_lon}`}
                </p>
              </div>
              <div className="flex space-x-2">
                {!c.is_active && (
                  <>
                    <button onClick={() => approve(c.centre_id)} className="text-green-600 hover:underline">Approve</button>
                    <button onClick={() => openReject(c.centre_id)} className="text-red-600 hover:underline">Reject</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Reject Modal (simple inline) */}
      {rejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Reject School</h3>
            <textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} placeholder="Reason for rejection" className="w-full border rounded px-3 py-2 mb-4" rows="3" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setRejectId(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmReject} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;