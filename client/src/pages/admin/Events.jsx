import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('all'); // 'all' for all schools
  const [form, setForm] = useState({
    course_id: '', session_date: '', topic: '', venue: '', max_attendees: ''
  });

  useEffect(() => {
    api.get('/centres').then(res => setSchools(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedSchool === 'all') {
      api.get('/events')
        .then(res => setEvents(res.data))
        .catch(() => toast.error('Failed to load events'));
    } else if (selectedSchool) {
      api.get(`/events/by-school?centre_id=${selectedSchool}`)
        .then(res => setEvents(res.data))
        .catch(() => toast.error('Failed to load events'));
    } else {
      setEvents([]);
    }
  }, [selectedSchool]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created');
      if (selectedSchool === 'all') {
        api.get('/events').then(res => setEvents(res.data));
      } else {
        api.get(`/events/by-school?centre_id=${selectedSchool}`).then(res => setEvents(res.data));
      }
      setForm({ course_id: '', session_date: '', topic: '', venue: '', max_attendees: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this event?')) {
      await api.put(`/events/${id}/cancel`);
      toast.success('Cancelled');
      if (selectedSchool === 'all') {
        api.get('/events').then(res => setEvents(res.data));
      } else {
        api.get(`/events/by-school?centre_id=${selectedSchool}`).then(res => setEvents(res.data));
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Event Management</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">View events for:</label>
        <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="border rounded px-3 py-2">
          <option value="all">All Schools</option>
          {schools.map(s => <option key={s.centre_id} value={s.centre_id}>{s.centre_name}</option>)}
        </select>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Create New Event</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="course_id" placeholder="Course ID" value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className="border rounded px-3 py-2" required />
          <input type="date" name="session_date" value={form.session_date} onChange={e => setForm({...form, session_date: e.target.value})} className="border rounded px-3 py-2" required />
          <input name="topic" placeholder="Topic" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} className="border rounded px-3 py-2" required />
          <input name="venue" placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="border rounded px-3 py-2" />
          <input type="number" name="max_attendees" placeholder="Max Attendees" value={form.max_attendees} onChange={e => setForm({...form, max_attendees: e.target.value})} className="border rounded px-3 py-2" />
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2 rounded">Create Event</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.map(ev => (
            <li key={ev.session_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{ev.topic} – {ev.course_title}</p>
                <p className="text-sm text-gray-500">{ev.session_date} @ {ev.venue || 'TBD'}</p>
              </div>
              <button onClick={() => handleCancel(ev.session_id)} className="text-red-600 hover:underline text-sm">Cancel</button>
            </li>
          ))}
          {events.length === 0 && <li className="py-4 text-center text-gray-500">No events found.</li>}
        </ul>
      </div>
    </div>
  );
};

export default Events;