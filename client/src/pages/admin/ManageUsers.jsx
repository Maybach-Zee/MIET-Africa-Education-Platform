import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'FACILITATOR' });

  useEffect(() => { api.get('/users').then(res => setUsers(res.data)); }, []);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('User created');
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="bg-white p-4 rounded shadow mb-6">
        <form onSubmit={create} className="grid grid-cols-2 gap-3">
          <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2" required />
          <select name="role" value={form.role} onChange={handleChange} className="border rounded px-3 py-2">
            <option>ADMIN</option><option>MANAGER</option><option>FACILITATOR</option><option>DONOR</option>
          </select>
          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Create User</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Name</th><th>Email</th><th>Role</th><th>Active</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.user_id}>
                <td className="px-6 py-4">{u.full_name}</td><td className="px-6 py-4">{u.email}</td><td className="px-6 py-4">{u.role}</td><td className="px-6 py-4">{u.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;