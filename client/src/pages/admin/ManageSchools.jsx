import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageSchools = () => {
  const [centres, setCentres] = useState([]);
  const [form, setForm] = useState({ centre_name: '', province_id: '', address: '', city: '', postal_code: '', phone_number: '', email: '' });
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    api.get('/centres').then(res => setCentres(res.data));
    api.get('/provinces').catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const register = async (e) => {
    e.preventDefault();
    try {
      await api.post('/centres/register', form);
      toast.success('School registered');
      const { data } = await api.get('/centres');
      setCentres(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const approve = async (id) => {
    await api.put(`/centres/${id}/approve`);
    toast.success('Approved');
    const { data } = await api.get('/centres');
    setCentres(data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">School Registration</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Register New School</h2>
        <form onSubmit={register} className="grid grid-cols-2 gap-4">
          <input name="centre_name" placeholder="School Name" value={form.centre_name} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="province_id" placeholder="Province ID" value={form.province_id} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="phone_number" placeholder="Phone" value={form.phone_number} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" />
          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Register</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {centres.map(c => (
            <li key={c.centre_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{c.centre_name} ({c.centre_code})</p>
                <p className="text-sm text-gray-500">{c.province_name} – {c.city} {!c.is_active && '(Pending)'}</p>
              </div>
              <div>
                {!c.is_active && (
                  <button onClick={() => approve(c.centre_id)} className="text-green-600 hover:underline">Approve</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageSchools;