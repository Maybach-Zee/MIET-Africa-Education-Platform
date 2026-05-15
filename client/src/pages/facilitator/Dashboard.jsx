import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FacilitatorDashboard = () => {
  // Tab state
  const [tab, setTab] = useState('courses');

  // Data states
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const fetchData = () => {
    // Fetch facilitator-specific data
    api.get('/facilitator/courses').then(res => setCourses(res.data)).catch(() => {});
    api.get('/facilitator/sessions').then(res => setSessions(res.data)).catch(() => {});
    api.get('/facilitator/assessments').then(res => setAssessments(res.data)).catch(() => {});
    api.get('/facilitator/attendance').then(res => setAttendance(res.data)).catch(() => {});
    // Event registration data
    api.get('/events/facilitator').then(res => setEvents(res.data)).catch(() => {});
    api.get('/events/my-registrations').then(res => setRegistrations(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (sessionId) => {
    try {
      await api.post('/events/register', { session_id: sessionId });
      toast.success('Registered!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCancelReg = async (sessionId) => {
    try {
      await api.delete('/events/register', { data: { session_id: sessionId } });
      toast.success('Registration cancelled');
      fetchData();
    } catch (err) {
      toast.error('Could not cancel');
    }
  };

  const isRegistered = (sessionId) => registrations.some(r => r.session_id === sessionId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded shadow">
        {[
          { key: 'courses', label: 'My Courses' },
          { key: 'sessions', label: 'My Sessions' },
          { key: 'assessments', label: 'My Assessments' },
          { key: 'attendance', label: 'Recent Attendance' },
          { key: 'events', label: 'Training Events' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'courses' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Courses I Facilitate</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500">You are not assigned to any courses yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {courses.map(c => (
                <li key={c.course_id} className="py-3">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-gray-500">
                    {c.course_code} | {c.is_primary ? 'Primary Facilitator' : 'Co-facilitator'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Upcoming Sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-gray-500">No sessions found for your courses.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {sessions.map(s => (
                <li key={s.session_id} className="py-3">
                  <p className="font-medium">{s.topic} – {s.course_title}</p>
                  <p className="text-sm text-gray-500">{s.session_date} | {s.venue || 'TBD'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'assessments' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">My Assessments</h2>
          {assessments.length === 0 ? (
            <p className="text-gray-500">No assessments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assessments.slice(0, 30).map(a => (
                    <tr key={a.assessment_id}>
                      <td className="px-4 py-2">{a.learner_name}</td>
                      <td className="px-4 py-2">{a.module_title}</td>
                      <td className="px-4 py-2">{a.score}/{a.max_score} ({a.percentage}%)</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          a.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {a.result}
                        </span>
                      </td>
                      <td className="px-4 py-2">{a.assessment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Recently Recorded Attendance</h2>
          {attendance.length === 0 ? (
            <p className="text-gray-500">No attendance records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map(a => (
                    <tr key={a.attendance_id}>
                      <td className="px-4 py-2">{a.learner_name}</td>
                      <td className="px-4 py-2">{a.session_topic}</td>
                      <td className="px-4 py-2">{a.session_date}</td>
                      <td className="px-4 py-2">{a.present ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'events' && (
        <div className="space-y-6">
          {/* Training Events Registration */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Available Training Events</h2>
            {events.length === 0 ? (
              <p className="text-gray-500">No upcoming events for your school.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {events.map(ev => (
                  <li key={ev.session_id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{ev.topic} – {ev.course_title}</p>
                      <p className="text-sm text-gray-500">{ev.session_date} @ {ev.venue || 'TBD'}</p>
                    </div>
                    <div>
                      {isRegistered(ev.session_id) ? (
                        <button onClick={() => handleCancelReg(ev.session_id)} className="text-red-600 hover:underline text-sm">
                          Cancel
                        </button>
                      ) : (
                        <button onClick={() => handleRegister(ev.session_id)} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm">
                          Register
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* My Registrations */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">My Registrations</h2>
            {registrations.length === 0 ? (
              <p className="text-gray-500">You haven't registered for any events.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {registrations.map(reg => (
                  <li key={reg.registration_id} className="py-3">
                    <p className="font-medium">{reg.topic} – {reg.course_title}</p>
                    <p className="text-sm text-gray-500">{reg.session_date}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitatorDashboard;