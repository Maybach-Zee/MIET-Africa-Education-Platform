import { useState, useEffect } from 'react';
import MapPicker from '../../components/MapPicker';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageSchools = () => {
  const [centres, setCentres] = useState([]);
  const [provinces, setProvinces] = useState([]);          // DB provinces
  const [locations, setLocations] = useState({ provinces: [] }); // JSON city data

  // Filters
  const [filterProvince, setFilterProvince] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinLearners, setFilterMinLearners] = useState('');

  // Registration form state
  const [form, setForm] = useState({
    centre_name: '', province_id: '', address: '', city: '', postal_code: '',
    phone_number: '', email: '', gps_latitude: '', gps_longitude: '', enrolled_learners: ''
  });

  // City dropdown options for currently selected province
  const [citiesForProvince, setCitiesForProvince] = useState([]);
  // Currently selected city object (for map pinning)
  const [selectedCity, setSelectedCity] = useState(null);

  // Rejection modal
  const [rejectId, setRejectId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  // ---------- Data fetching ----------
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
    // Load provinces from DB (for filter & form)
    api.get('/provinces').then(res => setProvinces(res.data)).catch(() => {});
    // Load city coordinates JSON
    api.get('/locations').then(res => setLocations(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchCentres();
  }, [filterProvince, filterStatus, filterMinLearners]);

  // ---------- Form handlers ----------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // When province changes, reset city/GPS and populate city dropdown
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

    // Find matching province in JSON data
    const provData = locations.provinces.find(p => p.name === selectedProvinceName);
    if (provData) {
      setCitiesForProvince(provData.cities);
    } else {
      setCitiesForProvince([]);
    }
    setSelectedCity(null);
  };

  // When a city is selected, update GPS coordinates and form city
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

  // When user manually clicks on the map, update coordinates
  const handleMapChange = ({ lat, lng }) => {
    setForm(prev => ({
      ...prev,
      gps_latitude: lat,
      gps_longitude: lng
    }));
    // (optional) clear city dropdown because the pin is now custom
    // setForm(prev => ({ ...prev, city: '' }));
    // setSelectedCity(null);
  };

  // ---------- CRUD operations ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/centres/register', form);
      toast.success('School registered');
      fetchCentres();
      // Reset form
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
          {/* School Name */}
          <input name="centre_name" placeholder="School Name" value={form.centre_name} onChange={handleChange} className="border rounded px-3 py-2" required />

          {/* Province Dropdown (from DB) */}
          <select name="province_id" value={form.province_id} onChange={handleProvinceChange} className="border rounded px-3 py-2" required>
            <option value="">Select Province</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
          </select>

          {/* City Dropdown (dynamic, from JSON) */}
          <select name="city" value={form.city} onChange={handleCityChange} className="border rounded px-3 py-2" disabled={!form.province_id || citiesForProvince.length === 0}>
            <option value="">Select City</option>
            {citiesForProvince.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
          </select>

          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="phone_number" placeholder="Phone" value={form.phone_number} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="enrolled_learners" type="number" placeholder="Number of enrolled learners" value={form.enrolled_learners} onChange={handleChange} className="border rounded px-3 py-2" />

          {/* Map & coordinates */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">School Location (click to place pin or select a city)</label>
            <MapPicker
              lat={form.gps_latitude}
              lng={form.gps_longitude}
              onChange={handleMapChange}
            />
          </div>

          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Register School</button>
        </form>
      </div>

      {/* School Directory */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {centres.map(c => (
            <li key={c.centre_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{c.centre_name} <span className="text-sm text-gray-500">({c.centre_code})</span></p>
                <p className="text-sm text-gray-600">
                  {c.province_name} – {c.city} | Enrolled: {c.enrolled_learners || 0}
                </p>
                <p className="text-xs">
                  Status: <span className={`font-semibold ${c.registration_status === 'APPROVED' ? 'text-green-600' : c.registration_status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {c.registration_status}
                  </span>
                  {c.rejection_comment && <span> – {c.rejection_comment}</span>}
                </p>
              </div>
              <div className="flex space-x-2">
                {c.registration_status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(c.centre_id)} className="text-green-600 hover:underline">Approve</button>
                    <button onClick={() => openRejectModal(c.centre_id)} className="text-red-600 hover:underline">Reject</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
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
    </div>
  );
};

export default ManageSchools;