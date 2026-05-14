import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({ donor_name: '', donor_organisation: '', amount: '', purpose: '', payment_method: 'EFT' });

  useEffect(() => { api.get('/donations').then(res => setDonations(res.data)); }, []);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const record = async (e) => {
    e.preventDefault();
    try {
      await api.post('/donations', form);
      toast.success('Donation recorded');
      const { data } = await api.get('/donations');
      setDonations(data);
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Donations</h1>
      <div className="bg-white p-4 rounded shadow mb-6">
        <form onSubmit={record} className="grid grid-cols-2 gap-3">
          <input name="donor_name" placeholder="Donor Name" value={form.donor_name} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="donor_organisation" placeholder="Organisation" value={form.donor_organisation} onChange={handleChange} className="border rounded px-3 py-2" />
          <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} className="border rounded px-3 py-2" required />
          <select name="payment_method" value={form.payment_method} onChange={handleChange} className="border rounded px-3 py-2">
            <option>EFT</option><option>CASH</option><option>CARD</option>
          </select>
          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Record Donation</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {donations.map(d => (
            <li key={d.donation_id} className="px-6 py-4">
              <p className="font-medium">{d.donor_name} ({d.donor_organisation})</p>
              <p className="text-sm text-gray-500">R{d.amount} – {d.purpose} – {d.payment_method}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Donations;