import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageResources = () => {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('LESSON_PLAN');
  const [gradeStart, setGradeStart] = useState('');
  const [gradeEnd, setGradeEnd] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState('English');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // resource_id when editing

  const fetch = () => api.get('/resources/admin').then(res => setResources(res.data));
  useEffect(() => { fetch(); }, []);

  const resetForm = () => {
    setTitle(''); setType('LESSON_PLAN'); setGradeStart(''); setGradeEnd('');
    setSubject(''); setLanguage('English'); setTags(''); setFile(null); setEditing(null);
  };

  // Populate form for editing
  const startEdit = (resource) => {
    setEditing(resource.resource_id);
    setTitle(resource.title);
    setType(resource.type);
    setGradeStart(resource.grade_start || '');
    setGradeEnd(resource.grade_end || '');
    setSubject(resource.subject || '');
    setLanguage(resource.language);
    setTags(resource.tags ? resource.tags.join(', ') : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('grade_start', gradeStart);
    formData.append('grade_end', gradeEnd);
    formData.append('subject', subject);
    formData.append('language', language);
    formData.append('tags', tags); // send as comma-separated string
    if (file) formData.append('file', file);

    try {
      setLoading(true);
      if (editing) {
        await api.put(`/resources/${editing}`, formData);
        toast.success('Resource updated');
      } else {
        await api.post('/resources', formData);
        toast.success('Resource uploaded');
      }
      fetch();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await api.put(`/resources/${id}/approve`);
    toast.success('Approved');
    fetch();
  };

  const handleArchive = async (id) => {
    if (window.confirm('Archive this resource? It will be hidden from teachers.')) {
      await api.put(`/resources/${id}/archive`);
      toast.success('Archived');
      fetch();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this resource?')) {
      await api.delete(`/resources/${id}`);
      toast.success('Deleted');
      fetch();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resource Management</h1>

      {/* Upload / Edit Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-medium mb-3">
          {editing ? 'Edit Resource' : 'Upload New Resource'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Title" value={title}
            onChange={e => setTitle(e.target.value)} className="border rounded px-3 py-2" required />
          <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-3 py-2">
            <option value="LESSON_PLAN">Lesson Plan</option>
            <option value="VIDEO">Video</option>
            <option value="WORKSHEET">Worksheet</option>
            <option value="GUIDE">Guide</option>
            <option value="OTHER">Other</option>
          </select>
          <input type="number" placeholder="Grade Start (1-12)" value={gradeStart}
            onChange={e => setGradeStart(e.target.value)} className="border rounded px-3 py-2" min="1" max="12" />
          <input type="number" placeholder="Grade End" value={gradeEnd}
            onChange={e => setGradeEnd(e.target.value)} className="border rounded px-3 py-2" min="1" max="12" />
          <input type="text" placeholder="Subject (e.g. Mathematics)" value={subject}
            onChange={e => setSubject(e.target.value)} className="border rounded px-3 py-2" />
          <select value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-3 py-2">
            <option>English</option>
            <option>isiZulu</option>
            <option>isiXhosa</option>
            <option>Afrikaans</option>
            <option>Sesotho</option>
          </select>
          <input type="text" placeholder="Tags (comma separated)" value={tags}
            onChange={e => setTags(e.target.value)} className="border rounded px-3 py-2" />
          <input type="file" onChange={e => setFile(e.target.files[0])} className="col-span-2" />
          <div className="col-span-2 flex space-x-2">
            <button type="submit" disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              {loading ? 'Saving...' : editing ? 'Update' : 'Upload'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm}
                className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* Resource List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {resources.map(r => (
            <li key={r.resource_id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{r.title}
                  <span className="text-sm text-gray-500 ml-2">({r.type})</span>
                </p>
                <p className="text-xs text-gray-400">
                  {r.subject && `Subject: ${r.subject} | `}
                  {r.grade_start && `Grades ${r.grade_start}-${r.grade_end} | `}
                  Language: {r.language}
                  {r.tags?.length > 0 && ` | Tags: ${r.tags.join(', ')}`}
                  <br />
                  Status: {r.is_approved ? 'Approved' : 'Pending'}
                  {!r.is_active && ' | Archived'}
                </p>
              </div>
              <div className="flex space-x-2">
                {!r.is_approved && r.is_active && (
                  <button onClick={() => handleApprove(r.resource_id)}
                    className="text-green-600 hover:underline">Approve</button>
                )}
                <button onClick={() => startEdit(r)}
                  className="text-blue-600 hover:underline">Edit</button>
                {r.is_active && (
                  <button onClick={() => handleArchive(r.resource_id)}
                    className="text-yellow-600 hover:underline">Archive</button>
                )}
                <button onClick={() => handleDelete(r.resource_id)}
                  className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageResources;