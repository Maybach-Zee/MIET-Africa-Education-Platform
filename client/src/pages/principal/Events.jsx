import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PrincipalEvents = () => {
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facilitators, setFacilitators] = useState([]);
  const [form, setForm] = useState({ course_id: '', session_date: '', topic: '', venue: '', facilitator_id: '' });

  useEffect(() => {
    // Fetch events for my school
    api.get('/events/principal').then(res => setEvents(res.data)).catch(() => {});
    // Fetch courses of my school (we need an endpoint GET /api/courses/mine)
    api.get('/courses/mine').then(res => setCourses(res.data)).catch(() => {});
    // Fetch teachers of my school
    api.get('/users/teachers').then(res => setFacilitators(res.data)).catch(() => {});
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created');
      api.get('/events/principal').then(res => setEvents(res.data));
      setForm({ course_id: '', session_date: '', topic: '', venue: '', facilitator_id: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this event?')) {
      await api.put(`/events/${id}/cancel`);
      toast.success('Cancelled');
      api.get('/events/principal').then(res => setEvents(res.data));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Training Events</h1>

      {/* Create Event Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Schedule New Event</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
          <select name="course_id" value={form.course_id} onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
          </select>
          <input type="date" name="session_date" value={form.session_date} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="topic" placeholder="Topic" value={form.topic} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} className="border rounded px-3 py-2" />
          <select name="facilitator_id" value={form.facilitator_id} onChange={handleChange} className="border rounded px-3 py-2">
            <option value="">Facilitator (optional)</option>
            {facilitators.map(f => <option key={f.user_id} value={f.user_id}>{f.full_name}</option>)}
          </select>
          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Create Event</button>
        </form>
      </div>

      {/* Events List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.map(ev => (
            <li key={ev.session_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{ev.topic} – {ev.course_title}</p>
                <p className="text-sm text-gray-500">{ev.session_date} @ {ev.venue}</p>
              </div>
              <button onClick={() => handleCancel(ev.session_id)} className="text-red-600 hover:underline">Cancel</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PrincipalEvents;