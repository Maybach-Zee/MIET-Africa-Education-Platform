import { useState, useEffect } from 'react';
import MapPicker from '../../components/MapPicker';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageSchools = () => {
  const [centres, setCentres] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [locations, setLocations] = useState({ provinces: [] });

  const [filterProvince, setFilterProvince] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinLearners, setFilterMinLearners] = useState('');

  const [form, setForm] = useState({
    centre_name: '', province_id: '', address: '', city: '', postal_code: '',
    phone_number: '', email: '', gps_latitude: '', gps_longitude: '', enrolled_learners: ''
  });

  const [citiesForProvince, setCitiesForProvince] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const [rejectId, setRejectId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  // Manager assignment modal
  const [assignModal, setAssignModal] = useState(null);
  const [managersList, setManagersList] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');

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
    api.get('/locations').then(res => setLocations(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchCentres();
  }, [filterProvince, filterStatus, filterMinLearners]);

  // ---- form handlers ----
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const selectedProvinceName = e.target.options[e.target.selectedIndex].text;
    setForm(prev => ({
      ...prev,
      province_id: provinceId,
      city: '',
      gps_latitude: '',
      gps_longitude: ''
    }));
    const provData = locations.provinces.find(p => p.name === selectedProvinceName);
    if (provData) {
      setCitiesForProvince(provData.cities);
    } else {
      setCitiesForProvince([]);
    }
    setSelectedCity(null);
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setForm(prev => ({ ...prev, city: cityName }));
    if (cityName) {
      const cityObj = citiesForProvince.find(c => c.name === cityName);
      if (cityObj) {
        setSelectedCity(cityObj);
        setForm(prev => ({
          ...prev,
          gps_latitude: cityObj.lat.toString(),
          gps_longitude: cityObj.lng.toString()
        }));
      }
    } else {
      setSelectedCity(null);
    }
  };

  const handleMapChange = ({ lat, lng }) => {
    setForm(prev => ({ ...prev, gps_latitude: lat, gps_longitude: lng }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/centres/register', form);
      toast.success('School registered');
      fetchCentres();
      setForm({
        centre_name: '', province_id: '', address: '', city: '', postal_code: '',
        phone_number: '', email: '', gps_latitude: '', gps_longitude: '', enrolled_learners: ''
      });
      setCitiesForProvince([]);
      setSelectedCity(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleApprove = async (id) => {
    await api.put(`/centres/${id}/approve`);
    toast.success('School approved');
    fetchCentres();
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectComment('');
  };

  const confirmReject = async () => {
    if (!rejectId) return;
    await api.put(`/centres/${rejectId}/reject`, { comment: rejectComment });
    toast.success('School rejected');
    setRejectId(null);
    fetchCentres();
  };

  // ---- manager assignment ----
  const openAssignManager = (centreId) => {
    api.get('/users/unassigned-managers')
      .then(res => {
        setManagersList(res.data);
        setAssignModal(centreId);
        setSelectedManager('');
      })
      .catch(() => toast.error('Could not load managers'));
  };

  const confirmAssignManager = async () => {
    if (!selectedManager) return;
    await api.put(`/centres/${assignModal}/assign-manager`, { manager_id: selectedManager });
    toast.success('Manager assigned');
    setAssignModal(null);
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

      {/* Registration Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Register a New School</h2>
        <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4">
          <input name="centre_name" placeholder="School Name" value={form.centre_name} onChange={handleChange} className="border rounded px-3 py-2" required />
          <select name="province_id" value={form.province_id} onChange={handleProvinceChange} className="border rounded px-3 py-2" required>
            <option value="">Select Province</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
          </select>
          <select name="city" value={form.city} onChange={handleCityChange} className="border rounded px-3 py-2" disabled={!form.province_id || citiesForProvince.length === 0}>
            <option value="">Select City</option>
            {citiesForProvince.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
          </select>
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="phone_number" placeholder="Phone" value={form.phone_number} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="enrolled_learners" type="number" placeholder="Number of enrolled learners" value={form.enrolled_learners} onChange={handleChange} className="border rounded px-3 py-2" />

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">School Location (click to place pin or select a city)</label>
            <MapPicker lat={form.gps_latitude} lng={form.gps_longitude} onChange={handleMapChange} />
          </div>

          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Register School</button>
        </form>
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
                  <div className="flex flex-wrap gap-2">
                    {c.registration_status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(c.centre_id)} className="text-green-600 hover:underline text-sm">Approve</button>
                        <button onClick={() => openRejectModal(c.centre_id)} className="text-red-600 hover:underline text-sm">Reject</button>
                      </>
                    )}
                    <button onClick={() => openAssignManager(c.centre_id)} className="text-blue-600 hover:underline text-sm">Assign Manager</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Reject School</h3>
            <textarea
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
              placeholder="Reason for rejection"
              className="w-full border rounded px-3 py-2 mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setRejectId(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmReject} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Assign Manager</h3>
            <select value={selectedManager} onChange={e => setSelectedManager(e.target.value)} className="w-full border rounded px-3 py-2 mb-4">
              <option value="">Select a manager</option>
              {managersList.map(m => <option key={m.user_id} value={m.user_id}>{m.full_name} ({m.email})</option>)}
            </select>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmAssignManager} className="px-4 py-2 bg-indigo-600 text-white rounded">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;