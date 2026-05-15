import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import MapPicker from '../../components/MapPicker';

const RegisterSchool = () => {
  const { user } = useAuth();
  const [provinces, setProvinces] = useState([]);
  const [locations, setLocations] = useState({ provinces: [] });
  const [myCentre, setMyCentre] = useState(null);
  const [form, setForm] = useState({
    centre_name: '', province_id: '', address: '', city: '', postal_code: '',
    phone_number: '', email: '', gps_latitude: '', gps_longitude: '', enrolled_learners: ''
  });
  const [citiesForProvince, setCitiesForProvince] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    api.get('/provinces').then(res => setProvinces(res.data)).catch(() => {});
    api.get('/locations').then(res => setLocations(res.data)).catch(() => {});
    api.get('/centres/my-centre').then(res => setMyCentre(res.data)).catch(() => setMyCentre(null));
  }, []);

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setForm(prev => ({ ...prev, province_id: provinceId, city: '', gps_latitude: '', gps_longitude: '' }));
    const selectedProvinceName = e.target.options[e.target.selectedIndex].text;
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
          gps_longitude: cityObj.lng.toString(),
        }));
      }
    } else {
      setSelectedCity(null);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleMapChange = ({ lat, lng }) => {
    setForm(prev => ({ ...prev, gps_latitude: lat, gps_longitude: lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/centres/register', form);
      toast.success('School registration submitted!');
      setMyCentre(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My School Registration</h1>
      {myCentre ? (
        <div className="bg-white p-6 rounded shadow">
          {/* ... existing status display ... */}
          <h2 className="text-xl font-semibold">{myCentre.centre_name}</h2>
          <p>Code: {myCentre.centre_code}</p>
          <p>Province: {myCentre.province_name}</p>
          <p>City: {myCentre.city}</p>
          <p>Enrolled Learners: {myCentre.enrolled_learners}</p>
          <p className={`mt-2 font-bold ${myCentre.registration_status === 'APPROVED' ? 'text-green-600' : myCentre.registration_status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>
            Status: {myCentre.registration_status}
          </p>
          {myCentre.rejection_comment && <p className="text-red-500">Reason: {myCentre.rejection_comment}</p>}
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-medium mb-3">Register Your School</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">School Location (pin placed when city selected, or click on map)</label>
              <MapPicker lat={form.gps_latitude} lng={form.gps_longitude} onChange={handleMapChange} />
            </div>
            <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Submit Registration</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterSchool;