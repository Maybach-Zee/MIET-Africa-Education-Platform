import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Assessments = () => {
  const [courses, setCourses] = useState([]);
  const [learners, setLearners] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Form state
  const [enrolmentId, setEnrolmentId] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState('WRITTEN_TEST');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [unitStandard, setUnitStandard] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Fetch courses
    api.get('/facilitator/courses')
      .then(res => setCourses(res.data))
      .catch(() => {});
    // Fetch recent assessments
    api.get('/facilitator/assessments')
      .then(res => setRecentAssessments(res.data))
      .catch(() => {});
  }, []);

  // When course changes, load its learners
  useEffect(() => {
    if (!selectedCourse) {
      setLearners([]);
      setEnrolmentId('');
      return;
    }
    api.get(`/facilitator/courses/${selectedCourse}/learners`)
      .then(res => setLearners(res.data))
      .catch(() => toast.error('Failed to load learners'));
  }, [selectedCourse]);

  const handleSubmit = async (e) => {
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
      // Clear form
      setModuleTitle('');
      setScore('');
      setMaxScore('100');
      setUnitStandard('');
      // Refresh recent assessments
      const { data } = await api.get('/facilitator/assessments');
      setRecentAssessments(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Record Assessments</h1>

      {/* Record Assessment Form */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">New Assessment</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {learners.map(l => <option key={l.enrolment_id} value={l.enrolment_id}>{l.first_name} {l.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Module Title</label>
            <input type="text" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
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
            <label className="block text-sm font-medium mb-1">Unit Standard Code</label>
            <input type="text" value={unitStandard} onChange={e => setUnitStandard(e.target.value)} className="w-full border rounded px-3 py-2" />
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

      {/* Recent Assessments */}
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
              {recentAssessments.slice(0, 20).map(a => (
                <tr key={a.assessment_id}>
                  <td className="px-4 py-2">{a.learner_name}</td>
                  <td className="px-4 py-2">{a.module_title}</td>
                  <td className="px-4 py-2">{a.score}/{a.max_score}</td>
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
              {recentAssessments.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500">No assessments recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assessments;