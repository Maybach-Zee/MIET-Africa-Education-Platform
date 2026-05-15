import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../../components/MapPicker';

const Register = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [locations, setLocations] = useState({ provinces: [] });
  const [citiesForProvince, setCitiesForProvince] = useState([]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    centre_name: '',
    province_id: '',
    city: '',
    gps_latitude: '',
    gps_longitude: '',
    enrolled_learners: ''
  });

  useEffect(() => {
    api.get('/provinces').then(res => setProvinces(res.data)).catch(() => {});
    api.get('/locations').then(res => setLocations(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const selectedProvinceName = e.target.options[e.target.selectedIndex].text;
    setForm(prev => ({ ...prev, province_id: provinceId, city: '', gps_latitude: '', gps_longitude: '' }));
    const provData = locations.provinces.find(p => p.name === selectedProvinceName);
    if (provData) {
      setCitiesForProvince(provData.cities);
    } else {
      setCitiesForProvince([]);
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setForm(prev => ({ ...prev, city: cityName }));
    if (cityName) {
      const cityObj = citiesForProvince.find(c => c.name === cityName);
      if (cityObj) {
        setForm(prev => ({
          ...prev,
          gps_latitude: cityObj.lat.toString(),
          gps_longitude: cityObj.lng.toString()
        }));
      }
    }
  };

  const handleMapChange = ({ lat, lng }) => {
    setForm(prev => ({ ...prev, gps_latitude: lat, gps_longitude: lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      toast.success('Registration submitted! Your school is pending approval.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Register Your School</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input name="full_name" placeholder="Your Full Name" value={form.full_name} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2" required />

          <input name="centre_name" placeholder="School Name" value={form.centre_name} onChange={handleChange} className="border rounded px-3 py-2 col-span-2" required />

          <select name="province_id" value={form.province_id} onChange={handleProvinceChange} className="border rounded px-3 py-2" required>
            <option value="">Select Province</option>
            {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province_name}</option>)}
          </select>

          <select name="city" value={form.city} onChange={handleCityChange} className="border rounded px-3 py-2" disabled={!form.province_id || citiesForProvince.length === 0}>
            <option value="">Select City</option>
            {citiesForProvince.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
          </select>

          <input name="enrolled_learners" type="number" placeholder="Number of enrolled learners" value={form.enrolled_learners} onChange={handleChange} className="border rounded px-3 py-2 col-span-2" />

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">School Location (select city or click map)</label>
            <MapPicker lat={form.gps_latitude} lng={form.gps_longitude} onChange={handleMapChange} />
          </div>

          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Submit Registration</button>
        </form>
      </div>
    </div>
  );
};

export default Register;