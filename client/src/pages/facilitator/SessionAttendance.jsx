import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SessionAttendance = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load facilitator's sessions
  useEffect(() => {
    api.get('/facilitator/sessions')
      .then(res => setSessions(res.data))
      .catch(() => toast.error('Failed to load sessions'));
  }, []);

  // Load learners when session selected
  useEffect(() => {
    if (!selectedSession) {
      setLearners([]);
      return;
    }
    api.get(`/facilitator/sessions/${selectedSession}/learners`)
      .then(res => setLearners(res.data))
      .catch(err => toast.error('Failed to load learners'));
  }, [selectedSession]);

  const togglePresent = (index) => {
    const updated = [...learners];
    updated[index].present = !updated[index].present;
    setLearners(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...learners];
    updated[index][field] = value;
    setLearners(updated);
  };

  const saveAttendance = async () => {
    if (!selectedSession) return;
    const records = learners.map(l => ({
      enrolment_id: l.enrolment_id,
      present: l.present,
      arrival_time: l.arrival_time || null,
      departure_time: l.departure_time || null,
      notes: l.notes || ''
    }));
    try {
      await api.post(`/facilitator/sessions/${selectedSession}/attendance`, { records });
      toast.success('Attendance saved');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Session Attendance</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <label className="block text-sm font-medium mb-1">Select Session</label>
        <select
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Choose a session --</option>
          {sessions.map(s => (
            <option key={s.session_id} value={s.session_id}>
              {s.session_date} - {s.topic} ({s.course_title})
            </option>
          ))}
        </select>
      </div>

      {selectedSession && learners.length > 0 && (
        <div className="bg-white p-6 rounded shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arrival</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departure</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {learners.map((l, idx) => (
                  <tr key={l.enrolment_id}>
                    <td className="px-4 py-2">{l.first_name} {l.last_name}</td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={l.present}
                        onChange={() => togglePresent(idx)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="time"
                        value={l.arrival_time || ''}
                        onChange={e => handleInputChange(idx, 'arrival_time', e.target.value)}
                        className="border rounded px-2 py-1 w-28"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="time"
                        value={l.departure_time || ''}
                        onChange={e => handleInputChange(idx, 'departure_time', e.target.value)}
                        className="border rounded px-2 py-1 w-28"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={l.notes || ''}
                        onChange={e => handleInputChange(idx, 'notes', e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={saveAttendance}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save Attendance
          </button>
        </div>
      )}

      {selectedSession && learners.length === 0 && (
        <div className="bg-white p-6 rounded shadow text-gray-500">
          No learners enrolled in this course.
        </div>
      )}
    </div>
  );
};

export default SessionAttendance;