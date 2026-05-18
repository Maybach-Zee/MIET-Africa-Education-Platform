import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const fetchDonations = () => {
    api.get('/donations').then(res => {
      setDonations(res.data);
      const sum = res.data.reduce((acc, d) => acc + parseFloat(d.amount), 0);
      setTotal(sum);
    }).catch(() => toast.error('Failed to load donations'));
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleProcess = async (id, status) => {
    try {
      await api.put(`/donations/${id}/process`, { payment_status: status });
      toast.success('Donation status updated');
      fetchDonations();
    } catch (err) {
      // Show the specific reason from the server if available
      const message =
        err.response?.data?.message ||
        'Update failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Donations</h1>

      <div className="bg-white p-4 rounded shadow mb-4 flex justify-between items-center">
        <div>
          <span className="text-gray-600">Total Donations: </span>
          <span className="text-2xl font-bold text-green-600">R {total.toFixed(2)}</span>
        </div>
        <div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="WAIVED">Waived</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donations
              .filter(d => !statusFilter || d.payment_status === statusFilter)
              .map(d => (
                <tr key={d.donation_id}>
                  <td className="px-6 py-4">{d.donor_name}</td>
                  <td className="px-6 py-4">{d.donor_email}</td>
                  <td className="px-6 py-4">R {d.amount}</td>
                  <td className="px-6 py-4">{d.purpose}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      d.payment_status === 'PAID' ? 'bg-green-100 text-green-700' :
                      d.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {d.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Donations;