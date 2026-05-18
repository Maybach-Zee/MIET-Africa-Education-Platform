import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'FACILITATOR' });

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(() => toast.error('Failed to load users'));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('User created');
      const { data } = await api.get('/users');
      setUsers(data);
      setForm({ full_name: '', email: '', password: '', role: 'FACILITATOR' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleActive = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await api.put(`/users/${userId}`, { is_active: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'}`);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted');
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Create New User</h2>
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2" required />
          <select name="role" value={form.role} onChange={handleChange} className="border rounded px-3 py-2">
            <option>ADMIN</option><option>MANAGER</option><option>FACILITATOR</option><option>Donor Manager</option>
          </select>
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2 rounded">Create User</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.user_id}>
                <td className="px-6 py-4">{u.full_name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.role  === 'DONOR' ? 'Donor Manager' : u.role}</td>
                <td className="px-6 py-4">{u.centre_name || '–'}</td>
                <td className="px-6 py-4">{u.is_active ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => toggleActive(u.user_id, u.is_active)} className="text-blue-600 hover:underline text-sm">
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => deleteUser(u.user_id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;