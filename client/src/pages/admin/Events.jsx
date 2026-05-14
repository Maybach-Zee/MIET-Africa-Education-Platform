import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    course_id: '', session_date: '', topic: '', venue: '', max_attendees: '', facilitator_id: ''
  });
  const [attendees, setAttendees] = useState({}); // session_id -> array of attendees

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created');
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (err) { toast.error('Failed'); }
  };

  const cancel = async (id) => {
    if (window.confirm('Cancel this event?')) {
      await api.put(`/events/${id}/cancel`);
      toast.success('Cancelled');
      const { data } = await api.get('/events');
      setEvents(data);
    }
  };

  const loadAttendees = async (sessionId) => {
    try {
      const { data } = await api.get(`/events/${sessionId}/attendees`);
      setAttendees(prev => ({ ...prev, [sessionId]: data }));
    } catch { toast.error('Could not load attendees'); }
  };

  const sendReminder = (sessionId) => {
    // Placeholder – would call backend to send push notifications
    toast.success('Reminder sent (simulated)');
    // In real implementation: api.post(`/events/${sessionId}/remind`)
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Training Events</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Create New Event</h2>
        <form onSubmit={create} className="grid grid-cols-2 gap-3">
          <input placeholder="Course ID" value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className="border rounded px-3 py-2" required />
          <input type="date" value={form.session_date} onChange={e => setForm({...form, session_date: e.target.value})} className="border rounded px-3 py-2" required />
          <input placeholder="Topic" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} className="border rounded px-3 py-2" required />
          <input placeholder="Venue" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="border rounded px-3 py-2" />
          <input type="number" placeholder="Max Attendees" value={form.max_attendees} onChange={e => setForm({...form, max_attendees: e.target.value})} className="border rounded px-3 py-2" />
          <input placeholder="Facilitator ID" value={form.facilitator_id} onChange={e => setForm({...form, facilitator_id: e.target.value})} className="border rounded px-3 py-2" />
          <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2 rounded">Create Event</button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.map(ev => (
            <li key={ev.session_id} className="px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium">{ev.topic} – {ev.course_title}</p>
                  <p className="text-sm text-gray-500">{ev.session_date} @ {ev.venue} | Max: {ev.max_attendees || 'unlimited'}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => loadAttendees(ev.session_id)} className="text-blue-600 hover:underline">View Attendees</button>
                  <button onClick={() => sendReminder(ev.session_id)} className="text-yellow-600 hover:underline">Send Reminder</button>
                  <button onClick={() => cancel(ev.session_id)} className="text-red-600 hover:underline">Cancel</button>
                </div>
              </div>
              {attendees[ev.session_id] && (
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm font-medium">Attendees:</p>
                  {attendees[ev.session_id].length === 0 ? <p className="text-xs text-gray-500">No registrations yet.</p> : (
                    <ul className="list-disc list-inside text-xs">
                      {attendees[ev.session_id].map(a => <li key={a}>{a}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Events;