import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Predefined module to unit-standard code mapping
const moduleCodes = {
  'Basic Literacy': 'US-10001',
  'Numeracy Foundations': 'US-10002',
  'Life Skills': 'US-10003',
  'ICT Essentials': 'US-10004',
  'Health & Safety': 'US-10005',
};

const FacilitatorDashboard = () => {
  const [tab, setTab] = useState('courses');

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [learnerCount, setLearnerCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [resources, setResources] = useState([]);

  // Attendance specific states
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionLearners, setSessionLearners] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  // Assessment form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrolmentId, setEnrolmentId] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [unitStandard, setUnitStandard] = useState('');
  const [assessmentType, setAssessmentType] = useState('WRITTEN_TEST');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseLearners, setCourseLearners] = useState([]);

  // Load all data
  const fetchAllData = () => {
    api.get('/facilitator/courses').then(res => {
      setCourses(res.data);
      setCourseCount(res.data.length);
    }).catch(() => {});
    api.get('/facilitator/sessions').then(res => setSessions(res.data)).catch(() => {});
    api.get('/facilitator/assessments').then(res => setAssessments(res.data)).catch(() => {});
    api.get('/facilitator/attendance').then(res => setAttendance(res.data)).catch(() => {});
    api.get('/events/facilitator').then(res => setEvents(res.data)).catch(() => {});
    api.get('/events/my-registrations').then(res => setRegistrations(res.data)).catch(() => {});
    fetchResources(); // Fetch school resources
  };

  const fetchResources = () => {
    api.get('/resources/facilitator')
      .then(res => setResources(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/facilitator/school').then(res => {
      if (res.data?.centre_id) {
        api.get(`/learners?centre_id=${res.data.centre_id}`)
          .then(l => setLearnerCount(l.data.length))
          .catch(() => setLearnerCount(0));
      }
      fetchAllData();
    }).catch(() => fetchAllData());
  }, []);

  // ---------- Sessions / Attendance ----------
  const fetchSessionLearners = (sessionId) => {
    setSelectedSession(sessionId);
    api.get(`/facilitator/sessions/${sessionId}/learners`)
      .then(res => {
        setSessionLearners(res.data);
        const allPresent = res.data.length > 0 && res.data.every(l => l.present);
        setAllSelected(allPresent);
      })
      .catch(() => toast.error('Failed to load learners'));
  };

  const toggleAllPresent = () => {
    const newState = !allSelected;
    setAllSelected(newState);
    setSessionLearners(prev => prev.map(l => ({ ...l, present: newState })));
  };

  const toggleLearnerPresent = (index) => {
    const updated = [...sessionLearners];
    updated[index].present = !updated[index].present;
    setSessionLearners(updated);
    setAllSelected(updated.every(l => l.present));
  };

  const handleLearnerInputChange = (index, field, value) => {
    const updated = [...sessionLearners];
    updated[index][field] = value;
    setSessionLearners(updated);
  };

  const saveAttendance = async () => {
    if (!selectedSession) return;
    const records = sessionLearners.map(l => ({
      enrolment_id: l.enrolment_id,
      present: l.present,
      arrival_time: l.arrival_time || null,
      departure_time: l.departure_time || null,
      notes: l.notes || ''
    }));
    try {
      await api.post(`/facilitator/sessions/${selectedSession}/attendance`, { records });
      toast.success('Attendance saved');
      fetchSessionLearners(selectedSession);
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  // ---------- Assessments ----------
  const handleModuleChange = (e) => {
    const mod = e.target.value;
    setModuleTitle(mod);
    setUnitStandard(moduleCodes[mod] || '');
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    if (!enrolmentId || !moduleTitle || !score || !maxScore) {
      return toast.error('Fill required fields');
    }
    try {
      await api.post('/facilitator/assessments', {
        enrolment_id: enrolmentId,
        module_title: moduleTitle,
        assessment_type: assessmentType,
        score: parseFloat(score),
        max_score: parseFloat(maxScore),
        unit_standard_code: unitStandard,
        assessment_date: assessmentDate
      });
      toast.success('Assessment recorded');
      setModuleTitle('');
      setUnitStandard('');
      setScore('');
      setMaxScore('100');
      api.get('/facilitator/assessments').then(res => setAssessments(res.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record');
    }
  };

  // When course changes, load its enrolled learners
  useEffect(() => {
    if (!selectedCourse) {
      setCourseLearners([]);
      setEnrolmentId('');
      return;
    }
    api.get(`/facilitator/courses/${selectedCourse}/learners`)
      .then(res => setCourseLearners(res.data))
      .catch(() => toast.error('Failed to load learners'));
  }, [selectedCourse]);

  // ---------- Event Registration ----------
  const handleRegister = async (sessionId) => {
    try {
      await api.post('/events/register', { session_id: sessionId });
      toast.success('Registered!');
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCancelReg = async (sessionId) => {
    try {
      await api.delete('/events/register', { data: { session_id: sessionId } });
      toast.success('Cancelled');
      fetchAllData();
    } catch (err) {
      toast.error('Could not cancel');
    }
  };

  const isRegistered = (sessionId) => registrations.some(r => r.session_id === sessionId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Learners in School</p>
          <p className="text-2xl font-bold">{learnerCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">My Courses</p>
          <p className="text-2xl font-bold">{courseCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-4 rounded shadow">
        {[
          { key: 'courses', label: 'My Courses' },
          { key: 'sessions', label: 'Sessions / Attendance' },
          { key: 'assessments', label: 'Assessments' },
          { key: 'resources', label: 'Resources' },
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

      {/* My Courses Tab */}
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
                    {c.course_code} | {c.is_primary ? 'Primary' : 'Co-facilitator'} | Learners enrolled: {c.learner_count || 0}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Sessions / Attendance Tab */}
      {tab === 'sessions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <label className="block text-sm font-medium mb-2">Select Session</label>
            <select
              value={selectedSession}
              onChange={e => fetchSessionLearners(e.target.value)}
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

          {selectedSession && sessionLearners.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Attendance</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAllPresent}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Select All
                </label>
              </div>
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
                    {sessionLearners.map((l, idx) => (
                      <tr key={l.enrolment_id}>
                        <td className="px-4 py-2">{l.first_name} {l.last_name}</td>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={l.present}
                            onChange={() => toggleLearnerPresent(idx)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="time"
                            value={l.arrival_time || ''}
                            onChange={e => handleLearnerInputChange(idx, 'arrival_time', e.target.value)}
                            className="border rounded px-2 py-1 w-28 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="time"
                            value={l.departure_time || ''}
                            onChange={e => handleLearnerInputChange(idx, 'departure_time', e.target.value)}
                            className="border rounded px-2 py-1 w-28 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={l.notes || ''}
                            onChange={e => handleLearnerInputChange(idx, 'notes', e.target.value)}
                            className="border rounded px-2 py-1 w-full text-sm"
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

          {selectedSession && sessionLearners.length === 0 && (
            <div className="bg-white p-6 rounded-xl shadow text-gray-500">
              No learners enrolled in the course for this session.
            </div>
          )}
        </div>
      )}

      {/* Assessments Tab */}
      {tab === 'assessments' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">Record Assessment</h2>
            <form onSubmit={handleAssessmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full border rounded px-3 py-2" required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Learner</label>
                <select value={enrolmentId} onChange={e => setEnrolmentId(e.target.value)} className="w-full border rounded px-3 py-2" required>
                  <option value="">Select Learner</option>
                  {courseLearners.map(l => <option key={l.enrolment_id} value={l.enrolment_id}>{l.first_name} {l.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Module</label>
                <select value={moduleTitle} onChange={handleModuleChange} className="w-full border rounded px-3 py-2" required>
                  <option value="">Select Module</option>
                  {Object.keys(moduleCodes).map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit Standard Code</label>
                <input type="text" value={unitStandard} onChange={e => setUnitStandard(e.target.value)} className="w-full border rounded px-3 py-2" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assessment Type</label>
                <select value={assessmentType} onChange={e => setAssessmentType(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option>WRITTEN_TEST</option>
                  <option>PRACTICAL</option>
                  <option>ASSIGNMENT</option>
                  <option>PROJECT</option>
                  <option>ORAL</option>
                  <option>PORTFOLIO</option>
                  <option>OBSERVATION</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input type="number" step="0.01" value={score} onChange={e => setScore(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Score</label>
                <input type="number" step="0.01" value={maxScore} onChange={e => setMaxScore(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assessment Date</label>
                <input type="date" value={assessmentDate} onChange={e => setAssessmentDate(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Record Assessment</button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">Recent Assessments</h2>
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
                  {assessments.slice(0, 20).map(a => (
                    <tr key={a.assessment_id}>
                      <td className="px-4 py-2">{a.learner_name}</td>
                      <td className="px-4 py-2">{a.module_title}</td>
                      <td className="px-4 py-2">{a.score}/{a.max_score}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          a.result === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{a.result}</span>
                      </td>
                      <td className="px-4 py-2">{a.assessment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {tab === 'resources' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">School Resources</h2>
          {resources.length === 0 ? (
            <p className="text-gray-500">No approved resources available yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {resources.map(r => (
                <li key={r.resource_id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{r.title} ({r.type})</p>
                    <p className="text-sm text-gray-500">
                      {r.subject && `Subject: ${r.subject} | `}
                      {r.grade_start && `Grades ${r.grade_start}-${r.grade_end} | `}
                      Language: {r.language}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Approved
                    </span>
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        Download / View
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Training Events Tab */}
      {tab === 'events' && (
        <div className="space-y-6">
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
                        <button onClick={() => handleCancelReg(ev.session_id)} className="text-red-600 hover:underline text-sm">Cancel</button>
                      ) : (
                        <button onClick={() => handleRegister(ev.session_id)} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm">Register</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

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