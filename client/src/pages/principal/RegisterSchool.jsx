import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SchoolManagement = () => {
  const [centre, setCentre] = useState(null);
  const [tab, setTab] = useState('info');

  // Courses
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    course_id: null,
    title: '',
    course_code: '',
    description: '',
    duration_hours: '',
    start_date: '',
    end_date: '',
    pass_mark: 50,
    max_learners: '',
    delivery_mode: 'IN_PERSON',
    course_fee: 0,
    facilitator_id: ''
  });
  const [editingCourse, setEditingCourse] = useState(false);

  // Learners
  const [learners, setLearners] = useState([]);
  const [learnerForm, setLearnerForm] = useState({
    learner_id: null,
    first_name: '',
    last_name: '',
    id_number: '',
    date_of_birth: '',
    gender: 'MALE',
    contact_number: '',
    address: ''
  });
  const [editingLearner, setEditingLearner] = useState(false);

  // Enrolments
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLearner, setSelectedLearner] = useState('');
  const [enrolmentsList, setEnrolmentsList] = useState([]);

  // School info edit
  const [editInfo, setEditInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    centre_name: '',
    address: '',
    city: '',
    postal_code: '',
    phone_number: '',
    email: ''
  });

  // Teachers list for facilitator assignment
  const [teachers, setTeachers] = useState([]);

  // Load centre
  const fetchCentre = () => {
    api.get('/centres/my-centre')
      .then(res => {
        setCentre(res.data);
        setInfoForm({
          centre_name: res.data.centre_name,
          address: res.data.address || '',
          city: res.data.city || '',
          postal_code: res.data.postal_code || '',
          phone_number: res.data.phone_number || '',
          email: res.data.email || ''
        });
      })
      .catch(() => toast.error('Could not load school data'));
  };

  const loadCourses = () => {
    api.get('/courses/mine').then(res => setCourses(res.data)).catch(() => {});
  };

  const loadLearners = () => {
    api.get(`/learners?centre_id=${centre?.centre_id}`).then(res => setLearners(res.data)).catch(() => {});
  };

  const loadEnrolments = () => {
    api.get('/enrolments/mine').then(res => setEnrolmentsList(res.data)).catch(() => {});
  };

  const loadTeachers = () => {
    api.get('/users/teachers').then(res => setTeachers(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchCentre();
  }, []);

  useEffect(() => {
    if (centre?.centre_id) {
      loadCourses();
      loadLearners();
      loadEnrolments();
      loadTeachers();
    }
  }, [centre]);

  // ---------- School Info ----------
  const handleInfoChange = (e) => setInfoForm({ ...infoForm, [e.target.name]: e.target.value });
  const handleInfoSave = async () => {
    try {
      await api.put('/centres/my-centre', infoForm);
      toast.success('School info updated');
      fetchCentre();
      setEditInfo(false);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  // ---------- Courses ----------
  const resetCourseForm = () => {
    setCourseForm({
      course_id: null, title: '', course_code: '', description: '', duration_hours: '',
      start_date: '', end_date: '', pass_mark: 50, max_learners: '',
      delivery_mode: 'IN_PERSON', course_fee: 0, facilitator_id: ''
    });
    setEditingCourse(false);
  };

  const handleCourseChange = (e) => setCourseForm({ ...courseForm, [e.target.name]: e.target.value });

  const handleAddOrUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      let courseId;
      if (editingCourse && courseForm.course_id) {
        await api.put(`/courses/${courseForm.course_id}`, courseForm);
        courseId = courseForm.course_id;
        toast.success('Course updated');
      } else {
        const { data } = await api.post('/courses', courseForm);
        courseId = data.course_id;
        toast.success('Course added');
      }

      // Assign facilitator if selected
      if (courseForm.facilitator_id && courseId) {
        await api.put(`/courses/${courseId}/assign-facilitator`, {
          facilitator_id: courseForm.facilitator_id
        });
      }

      resetCourseForm();
      loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      ...course,
      course_id: course.course_id,
      facilitator_id: '' // reset; you could fetch existing assignment
    });
    setEditingCourse(true);
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Delete this course?')) {
      await api.delete(`/courses/${id}`);
      toast.success('Deleted');
      loadCourses();
    }
  };

  // ---------- Learners ----------
  const resetLearnerForm = () => {
    setLearnerForm({
      learner_id: null, first_name: '', last_name: '', id_number: '',
      date_of_birth: '', gender: 'MALE', contact_number: '', address: ''
    });
    setEditingLearner(false);
  };

  const handleLearnerChange = (e) => setLearnerForm({ ...learnerForm, [e.target.name]: e.target.value });

  const handleAddOrUpdateLearner = async (e) => {
    e.preventDefault();
    try {
      if (editingLearner && learnerForm.learner_id) {
        await api.put(`/learners/${learnerForm.learner_id}`, learnerForm);
        toast.success('Learner updated');
      } else {
        await api.post('/learners', { ...learnerForm, centre_id: centre.centre_id });
        toast.success('Learner added');
      }
      resetLearnerForm();
      loadLearners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleEditLearner = (learner) => {
    setLearnerForm({ ...learner, learner_id: learner.learner_id });
    setEditingLearner(true);
  };

  const handleDeleteLearner = async (id) => {
    if (window.confirm('Delete this learner?')) {
      await api.delete(`/learners/${id}`);
      toast.success('Deleted');
      loadLearners();
    }
  };

  // ---------- Enrolments ----------
  const handleEnrol = async () => {
    if (!selectedCourse || !selectedLearner) return toast.error('Select both');
    try {
      await api.post('/enrolments', {
        learner_id: selectedLearner,
        course_id: selectedCourse,
        enrol_date: new Date().toISOString().split('T')[0]
      });
      toast.success('Learner enrolled');
      setSelectedCourse('');
      setSelectedLearner('');
      loadEnrolments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrolment failed');
    }
  };

  if (!centre) return <div className="p-6 text-center">Loading school data...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My School: {centre.centre_name}</h1>
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${centre.registration_status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        Status: {centre.registration_status}
      </div>

      <div className="flex gap-2 bg-white p-4 rounded shadow">
        {[
          { key: 'info', label: 'School Info' },
          { key: 'courses', label: 'Courses' },
          { key: 'learners', label: 'Students' },
          { key: 'enrolments', label: 'Enrolments' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded text-sm font-medium ${tab === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {tab === 'info' && (
        <div className="bg-white p-6 rounded-xl shadow">
          {!editInfo ? (
            <>
              <h2 className="text-lg font-semibold mb-3">School Information</h2>
              <p><strong>Code:</strong> {centre.centre_code}</p>
              <p><strong>Province:</strong> {centre.province_name}</p>
              <p><strong>City:</strong> {centre.city}</p>
              <p><strong>Address:</strong> {centre.address}</p>
              <p><strong>Phone:</strong> {centre.phone_number}</p>
              <p><strong>Email:</strong> {centre.email}</p>
              <button onClick={() => setEditInfo(true)} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">Edit Info</button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-3">Edit School Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <input name="centre_name" value={infoForm.centre_name} onChange={handleInfoChange} placeholder="School Name" className="border rounded px-3 py-2" />
                <input name="city" value={infoForm.city} onChange={handleInfoChange} placeholder="City" className="border rounded px-3 py-2" />
                <input name="postal_code" value={infoForm.postal_code} onChange={handleInfoChange} placeholder="Postal Code" className="border rounded px-3 py-2" />
                <input name="phone_number" value={infoForm.phone_number} onChange={handleInfoChange} placeholder="Phone" className="border rounded px-3 py-2" />
                <input name="email" value={infoForm.email} onChange={handleInfoChange} placeholder="Email" className="border rounded px-3 py-2" />
                <input name="address" value={infoForm.address} onChange={handleInfoChange} placeholder="Address" className="border rounded px-3 py-2 col-span-2" />
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={handleInfoSave} className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => setEditInfo(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {tab === 'courses' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
          <form onSubmit={handleAddOrUpdateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input name="course_code" placeholder="Course Code" value={courseForm.course_code} onChange={handleCourseChange} className="border rounded px-3 py-2" required />
            <input name="title" placeholder="Title" value={courseForm.title} onChange={handleCourseChange} className="border rounded px-3 py-2" required />
            <input name="description" placeholder="Description" value={courseForm.description} onChange={handleCourseChange} className="border rounded px-3 py-2" />
            <input name="duration_hours" type="number" placeholder="Duration (hours)" value={courseForm.duration_hours} onChange={handleCourseChange} className="border rounded px-3 py-2" />
            <input name="start_date" type="date" value={courseForm.start_date} onChange={handleCourseChange} className="border rounded px-3 py-2" />
            <input name="end_date" type="date" value={courseForm.end_date} onChange={handleCourseChange} className="border rounded px-3 py-2" />
            <select name="delivery_mode" value={courseForm.delivery_mode} onChange={handleCourseChange} className="border rounded px-3 py-2">
              <option>IN_PERSON</option><option>ONLINE</option><option>HYBRID</option>
            </select>
            <select name="facilitator_id" value={courseForm.facilitator_id} onChange={handleCourseChange} className="border rounded px-3 py-2">
              <option value="">No Facilitator</option>
              {teachers.map(t => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}
            </select>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">{editingCourse ? 'Update' : 'Add'}</button>
              {editingCourse && <button type="button" onClick={resetCourseForm} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
            </div>
          </form>

          <ul className="divide-y divide-gray-200">
            {courses.map(c => (
              <li key={c.course_id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{c.title} ({c.course_code})</p>
                  <p className="text-sm text-gray-500">{c.start_date} to {c.end_date}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditCourse(c)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDeleteCourse(c.course_id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </div>
              </li>
            ))}
            {courses.length === 0 && <li className="py-4 text-center text-gray-500">No courses yet.</li>}
          </ul>
        </div>
      )}

      {/* Learners Tab */}
      {tab === 'learners' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">{editingLearner ? 'Edit Student' : 'Add Student'}</h2>
          <form onSubmit={handleAddOrUpdateLearner} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input name="first_name" placeholder="First Name" value={learnerForm.first_name} onChange={handleLearnerChange} className="border rounded px-3 py-2" required />
            <input name="last_name" placeholder="Last Name" value={learnerForm.last_name} onChange={handleLearnerChange} className="border rounded px-3 py-2" required />
            <input name="id_number" placeholder="ID Number" value={learnerForm.id_number} onChange={handleLearnerChange} className="border rounded px-3 py-2" required maxLength={13} />
            <input name="date_of_birth" type="date" value={learnerForm.date_of_birth} onChange={handleLearnerChange} className="border rounded px-3 py-2" required />
            <select name="gender" value={learnerForm.gender} onChange={handleLearnerChange} className="border rounded px-3 py-2">
              <option>MALE</option><option>FEMALE</option><option>NON_BINARY</option><option>PREFER_NOT_TO_SAY</option>
            </select>
            <input name="contact_number" placeholder="Contact Number" value={learnerForm.contact_number} onChange={handleLearnerChange} className="border rounded px-3 py-2" />
            <input name="address" placeholder="Address" value={learnerForm.address} onChange={handleLearnerChange} className="border rounded px-3 py-2" />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">{editingLearner ? 'Update' : 'Add'}</button>
              {editingLearner && <button type="button" onClick={resetLearnerForm} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {learners.map(l => (
                  <tr key={l.learner_id}>
                    <td className="px-4 py-2">{l.first_name} {l.last_name}</td>
                    <td className="px-4 py-2">{l.id_number}</td>
                    <td className="px-4 py-2">{l.status}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => handleEditLearner(l)} className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDeleteLearner(l.learner_id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
                {learners.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-2 text-center text-gray-500">No students yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enrolments Tab */}
      {tab === 'enrolments' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Enrol Learner in Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Learner</label>
              <select value={selectedLearner} onChange={e => setSelectedLearner(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Select Learner</option>
                {learners.map(l => <option key={l.learner_id} value={l.learner_id}>{l.first_name} {l.last_name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleEnrol} className="bg-indigo-600 text-white px-4 py-2 rounded w-full">Enrol</button>
            </div>
          </div>

          <h3 className="text-md font-medium mb-2">Current Enrolments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enrol Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrolmentsList.map(e => (
                  <tr key={e.enrolment_id}>
                    <td className="px-4 py-2">{e.learner_name}</td>
                    <td className="px-4 py-2">{e.course_title}</td>
                    <td className="px-4 py-2">{e.enrol_date}</td>
                    <td className="px-4 py-2">{e.completion_status}</td>
                  </tr>
                ))}
                {enrolmentsList.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-2 text-center text-gray-500">No enrolments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManagement;