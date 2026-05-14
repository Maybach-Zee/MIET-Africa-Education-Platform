import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ course_id: '', session_date: '', topic: '', venue: '' });

  useEffect(() => { api.get('/events').then(res => setEvents(res.data)); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created');
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (err) {
      toast.error('Failed');
    }
  };

  const cancel = async (id) => {
    if (window.confirm('Cancel this event?')) {
      await api.put(`/events/${id}/cancel`);
      toast.success('Cancelled');
      const { data } = await api.get('/events');
      setEvents(data);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Training Events</h1>
      <div className="bg-white p-4 rounded shadow mb-6">
        <form onSubmit={create} className="grid grid-cols-2 gap-3">
          <input placeholder="Course ID" value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className="border rounded px-3 py-2" required />
          <input type="date" value={form.session_date} onChange={e => setForm({...form, session_date: e.target.value})} className="border rounded px-3 py-2" required />
          <input placeholder="Topic" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} className="border rounded px-3 py-2" required />
          <input placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="border rounded px-3 py-2" />
          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Create Event</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.map(ev => (
            <li key={ev.session_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{ev.topic} – {ev.course_title}</p>
                <p className="text-sm text-gray-500">{ev.session_date} @ {ev.venue}</p>
              </div>
              <button onClick={() => cancel(ev.session_id)} className="text-red-600 hover:underline">Cancel</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Events;