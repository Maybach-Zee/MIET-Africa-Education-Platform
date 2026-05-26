import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [centre, setCentre] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [learnerCount, setLearnerCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);

  // Teacher edit state
  const [editTeacherId, setEditTeacherId] = useState(null);
  const [editTeacherForm, setEditTeacherForm] = useState({ full_name: '', email: '' });

  // Teacher add state (already existed)
  const [newTeacher, setNewTeacher] = useState({ full_name: '', email: '', password: '' });

  // Resource upload (existing)
  const [resForm, setResForm] = useState({ title: '', type: 'LESSON_PLAN', grade_start: '', grade_end: '', subject: '', language: 'English', tags: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchCentre = () => {
    api.get('/centres/my-centre').then(res => {
      setCentre(res.data);
      if (res.data?.centre_id) {
        api.get(`/learners?centre_id=${res.data.centre_id}`).then(r => setLearnerCount(r.data.length)).catch(() => setLearnerCount(0));
        api.get('/courses/mine').then(r => setCourseCount(r.data.length)).catch(() => setCourseCount(0));
        fetchTeachers();
        fetchResources();
        fetchEvents();
      }
    }).catch(() => toast.error('Could not load school data'));
  };

  const fetchTeachers = () => {
    api.get('/users/teachers').then(res => setTeachers(res.data)).catch(() => {});
  };

  const fetchResources = () => {
    api.get('/resources/mine')
      .then(res => setResources(res.data))
      .catch(err => {
        console.error('Failed to fetch resources', err);
        // optional toast: toast.error('Failed to load resources');
      });
  };

  const fetchEvents = () => {
    api.get('/events/principal').then(res => setEvents(res.data)).catch(() => {});
  };

  useEffect(() => { fetchCentre(); }, []);

  // Add teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/facilitator', newTeacher);
      toast.success('Teacher added');
      setNewTeacher({ full_name: '', email: '', password: '' });
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  // Edit teacher
  const startEditTeacher = (teacher) => {
    setEditTeacherId(teacher.user_id);
    setEditTeacherForm({ full_name: teacher.full_name, email: teacher.email });
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/teacher/${editTeacherId}`, editTeacherForm);
      toast.success('Teacher updated');
      setEditTeacherId(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const toggleTeacherActive = async (teacherId) => {
    try {
      await api.put(`/users/teacher/${teacherId}/toggle-active`);
      toast.success('Status toggled');
      fetchTeachers();
    } catch (err) {
      toast.error('Failed to toggle');
    }
  };

  // Resource upload (keep existing)
  const handleResChange = (e) => setResForm({ ...resForm, [e.target.name]: e.target.value });
  const handleResourceUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    const formData = new FormData();
    formData.append('title', resForm.title);
    formData.append('type', resForm.type);
    formData.append('grade_start', resForm.grade_start);
    formData.append('grade_end', resForm.grade_end);
    formData.append('subject', resForm.subject);
    formData.append('language', resForm.language);
    formData.append('file', file);
    try {
      setUploading(true);
      await api.post('/resources', formData);
      toast.success('Resource uploaded');
      setResForm({ title: '', type: 'LESSON_PLAN', grade_start: '', grade_end: '', subject: '', language: 'English' });
      setFile(null);
      fetchResources();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleArchiveResource = async (id) => {
    if (!window.confirm('Archive this resource?')) return;
    try {
      await api.put(`/resources/${id}/archive`);
      toast.success('Archived');
      fetchResources();
    } catch (err) {
      toast.error('Failed to archive');
    }
  };
  
  const handleDeleteResource = async (id) => {
    if (!window.confirm('Permanently delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Deleted');
      fetchResources();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (!centre) return <div className="p-6 text-center">Loading school data...</div>;

  return (
    <div className="space-y-6">
      {/* School Info Banner (keep as before) */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">{centre.centre_name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-gray-600">Code: {centre.centre_code}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${centre.registration_status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {centre.registration_status}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Teachers</p>
            <p className="text-2xl font-bold text-indigo-600">{teachers.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Learners Enrolled</p>
            <p className="text-2xl font-bold text-green-600">{learnerCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Courses</p>
            <p className="text-2xl font-bold text-purple-600">{courseCount}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Resources</p>
            <p className="text-2xl font-bold text-orange-600">{resources.length}</p>
          </div>
        </div>
      </div>

      {centre.registration_status !== 'APPROVED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Your school is pending admin approval.
        </div>
      )}

      {/* Teachers Section with Edit & Toggle */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Teachers</h2>
        {centre.registration_status === 'APPROVED' && (
          <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <input type="text" placeholder="Full Name" value={newTeacher.full_name}
              onChange={e => setNewTeacher({...newTeacher, full_name: e.target.value})} className="border rounded px-3 py-2" required />
            <input type="email" placeholder="Email" value={newTeacher.email}
              onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} className="border rounded px-3 py-2" required />
            <input type="password" placeholder="Password" value={newTeacher.password}
              onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} className="border rounded px-3 py-2" required />
            <button type="submit" className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Add Teacher</button>
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Active</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Training Completed</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teachers.map(t => (
                <tr key={t.user_id}>
                  <td className="px-4 py-2">{editTeacherId === t.user_id ? (
                    <input type="text" value={editTeacherForm.full_name} onChange={e => setEditTeacherForm({...editTeacherForm, full_name: e.target.value})} className="border rounded px-2 py-1 w-full" />
                  ) : t.full_name}</td>
                  <td className="px-4 py-2">{editTeacherId === t.user_id ? (
                    <input type="email" value={editTeacherForm.email} onChange={e => setEditTeacherForm({...editTeacherForm, email: e.target.value})} className="border rounded px-2 py-1 w-full" />
                  ) : t.email}</td>
                  <td className="px-4 py-2">{t.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2">{t.training_completed ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {editTeacherId === t.user_id ? (
                      <>
                        <button onClick={handleEditTeacher} className="text-green-600 hover:underline text-sm">Save</button>
                        <button onClick={() => setEditTeacherId(null)} className="text-gray-600 hover:underline text-sm">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditTeacher(t)} className="text-blue-600 hover:underline text-sm">Edit</button>
                        <button onClick={() => toggleTeacherActive(t.user_id)} className="text-orange-600 hover:underline text-sm">
                          {t.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && <tr><td colSpan="5" className="px-4 py-2 text-center text-gray-500">No teachers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>


      {/* Resources Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Learning Resources</h2>
        {centre.registration_status === 'APPROVED' && (
          <form onSubmit={handleResourceUpload} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <input name="title" placeholder="Resource Title" value={resForm.title} onChange={handleResChange} className="border rounded px-3 py-2" required />
            <select name="type" value={resForm.type} onChange={handleResChange} className="border rounded px-3 py-2">
              <option>LESSON_PLAN</option>
              <option>VIDEO</option>
              <option>WORKSHEET</option>
              <option>GUIDE</option>
            </select>
            <input name="grade_start" type="number" placeholder="Grade Start" value={resForm.grade_start} onChange={handleResChange} className="border rounded px-3 py-2" />
            <input name="grade_end" type="number" placeholder="Grade End" value={resForm.grade_end} onChange={handleResChange} className="border rounded px-3 py-2" />
            <input name="subject" placeholder="Subject" value={resForm.subject} onChange={handleResChange} className="border rounded px-3 py-2" />
            <select name="language" value={resForm.language} onChange={handleResChange} className="border rounded px-3 py-2">
              <option>English</option>
              <option>isiZulu</option>
              <option>isiXhosa</option>
              <option>Afrikaans</option>
            </select>
            <input type="file" onChange={e => setFile(e.target.files[0])} className="col-span-2" required />
            <button type="submit" disabled={uploading} className="col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
              {uploading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </form>
        )}
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
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs rounded-full ${r.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {r.is_approved ? 'Approved' : 'Pending'}
        </span>
        <button onClick={() => handleArchiveResource(r.resource_id)} className="text-yellow-600 hover:underline text-sm">Archive</button>
        <button onClick={() => handleDeleteResource(r.resource_id)} className="text-red-600 hover:underline text-sm">Delete</button>
      </div>
    </li>
  ))}
  {resources.length === 0 && <li className="py-4 text-center text-gray-500">No resources uploaded yet.</li>}
</ul>
      </div>

      {/* Events Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <Link to="/events" className="text-indigo-600 hover:underline">Manage Events →</Link>
        </div>
        <ul className="divide-y divide-gray-200">
          {events.slice(0, 5).map(ev => (
            <li key={ev.session_id} className="py-3">
              <p className="font-medium">{ev.topic} – {ev.course_title}</p>
              <p className="text-sm text-gray-500">{ev.session_date} @ {ev.venue || 'TBD'}</p>
            </li>
          ))}
          {events.length === 0 && <li className="py-4 text-center text-gray-500">No events scheduled.</li>}
        </ul>
      </div>
    </div>
  );
};

export default PrincipalDashboard;