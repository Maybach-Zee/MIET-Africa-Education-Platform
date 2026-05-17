import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PrincipalEvents = () => {
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    course_id: '', session_date: '', topic: '', venue: '', max_attendees: ''
  });

  // Registrations modal
  const [regsModal, setRegsModal] = useState(null); // session id
  const [regs, setRegs] = useState([]);

  useEffect(() => {
    api.get('/events/principal').then(res => setEvents(res.data)).catch(() => toast.error('Could not load events'));
    api.get('/courses/mine').then(res => setCourses(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created');
      api.get('/events/principal').then(res => setEvents(res.data));
      setForm({ course_id: '', session_date: '', topic: '', venue: '', max_attendees: '' });
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

  const fetchRegistrations = (sessionId) => {
    api.get(`/events/${sessionId}/registrations`)
      .then(res => {
        setRegs(res.data);
        setRegsModal(sessionId);
      })
      .catch(() => toast.error('Failed to load registrations'));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Training Events</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Schedule New Event</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select name="course_id" value={form.course_id} onChange={handleChange} className="border rounded px-3 py-2" required>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
          </select>
          <input type="date" name="session_date" value={form.session_date} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="topic" placeholder="Topic" value={form.topic} onChange={handleChange} className="border rounded px-3 py-2" required />
          <input name="venue" placeholder="Venue" value={form.venue} onChange={handleChange} className="border rounded px-3 py-2" />
          <input type="number" name="max_attendees" placeholder="Max Attendees" value={form.max_attendees} onChange={handleChange} className="border rounded px-3 py-2" />
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
              <div className="flex gap-2">
                <button onClick={() => fetchRegistrations(ev.session_id)} className="text-blue-600 hover:underline text-sm">View Registrations</button>
                <button onClick={() => handleCancel(ev.session_id)} className="text-red-600 hover:underline text-sm">Cancel</button>
              </div>
            </li>
          ))}
          {events.length === 0 && <li className="py-4 text-center text-gray-500">No events yet.</li>}
        </ul>
      </div>

      {/* Registrations Modal */}
      {regsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Registered Teachers</h3>
            {regs.length === 0 ? (
              <p className="text-gray-500">No registrations yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {regs.map(r => (
                  <li key={r.user_id} className="py-2">
                    <span className="font-medium">{r.full_name}</span>
                    <span className="text-sm text-gray-500 ml-2">({r.email})</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(r.registered_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setRegsModal(null)} className="mt-4 bg-gray-200 px-4 py-2 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalEvents;