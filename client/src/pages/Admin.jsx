import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Spinner from '../components/Spinner.jsx';

const emptyLesson = { title: '', videoUrl: '', duration: '' };
const emptyCourse = {
  title: '',
  description: '',
  category: '',
  level: 'Beginner',
  instructor: '',
  imageUrl: '',
  lessons: [{ ...emptyLesson }],
};

export default function Admin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const flashTimer = useRef(null);

  const load = () =>
    api
      .get('/courses')
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  // Show a message for 3.5s; a new message cancels the previous timer
  const flash = (type, text) => {
    clearTimeout(flashTimer.current);
    setMessage({ type, text });
    flashTimer.current = setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onLessonChange = (i, field, value) => {
    const lessons = form.lessons.map((l, idx) => (idx === i ? { ...l, [field]: value } : l));
    setForm({ ...form, lessons });
  };

  const addLesson = () => setForm({ ...form, lessons: [...form.lessons, { ...emptyLesson }] });
  const removeLesson = (i) => setForm({ ...form, lessons: form.lessons.filter((_, idx) => idx !== i) });

  const startEdit = (course) => {
    setEditingId(course._id);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      instructor: course.instructor,
      imageUrl: course.imageUrl,
      lessons: course.lessons.map(({ _id, title, videoUrl, duration }) => ({ _id, title, videoUrl, duration })),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCourse);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // drop completely empty lesson rows
    const payload = { ...form, lessons: form.lessons.filter((l) => l.title.trim() || l.videoUrl.trim()) };
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
        flash('success', 'Course updated');
      } else {
        await api.post('/courses', payload);
        flash('success', 'Course created');
      }
      resetForm();
      load();
    } catch (err) {
      flash('error', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This also removes all enrollments.`)) return;
    try {
      await api.delete(`/courses/${course._id}`);
      flash('success', 'Course deleted');
      if (editingId === course._id) resetForm();
      load();
    } catch (err) {
      flash('error', errorMessage(err));
    }
  };

  const totalStudents = courses.reduce((s, c) => s + (c.students || 0), 0);
  const totalLessons = courses.reduce((s, c) => s + (c.lessonCount || 0), 0);

  return (
    <div className="container section admin">
      <div className="dash-header">
        <div>
          <h1>Admin panel</h1>
          <p className="muted">Create, edit and delete courses.</p>
        </div>
      </div>

      <div className="tiles">
        <div className="tile">
          <span className="tile-label">Courses</span>
          <strong>{courses.length}</strong>
        </div>
        <div className="tile">
          <span className="tile-label">Lessons</span>
          <strong>{totalLessons}</strong>
        </div>
        <div className="tile">
          <span className="tile-label">Enrollments</span>
          <strong>{totalStudents}</strong>
        </div>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-grid">
        {/* ---------- Course form ---------- */}
        <form className="card admin-form" onSubmit={onSubmit}>
          <h2>{editingId ? 'Edit course' : 'Add new course'}</h2>

          <label>
            Title
            <input name="title" value={form.title} onChange={onChange} required />
          </label>
          <label>
            Description
            <textarea name="description" rows="3" value={form.description} onChange={onChange} required />
          </label>
          <div className="form-row">
            <label>
              Category
              <input
                name="category"
                value={form.category}
                onChange={onChange}
                list="category-options"
                placeholder="e.g. Web Development"
                required
              />
              <datalist id="category-options">
                {[...new Set(courses.map((c) => c.category))].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label>
              Level
              <select name="level" value={form.level} onChange={onChange}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
          </div>
          <label>
            Instructor
            <input name="instructor" value={form.instructor} onChange={onChange} required />
          </label>
          <label>
            Image URL
            <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." />
          </label>
          {form.imageUrl && <img className="img-preview" src={form.imageUrl} alt="Preview" />}

          <h3>Lessons</h3>
          {form.lessons.map((lesson, i) => (
            <div className="lesson-edit" key={i}>
              <span className="lesson-num">{i + 1}</span>
              <input
                placeholder="Lesson title"
                value={lesson.title}
                onChange={(e) => onLessonChange(i, 'title', e.target.value)}
              />
              <input
                placeholder="YouTube or .mp4 URL"
                value={lesson.videoUrl}
                onChange={(e) => onLessonChange(i, 'videoUrl', e.target.value)}
              />
              <input
                className="input-small"
                placeholder="10 min"
                value={lesson.duration}
                onChange={(e) => onLessonChange(i, 'duration', e.target.value)}
              />
              <button type="button" className="icon-btn" onClick={() => removeLesson(i)} title="Remove lesson">
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addLesson}>
            + Add lesson
          </button>

          <div className="form-actions">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create course'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ---------- Course table ---------- */}
        <div className="card">
          <h2>All courses</h2>
          {loading ? (
            <Spinner />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Lessons</th>
                    <th>Students</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id} className={editingId === c._id ? 'row-active' : ''}>
                      <td>
                        <Link to={`/courses/${c._id}`}>{c.title}</Link>
                        <div className="muted small">{c.category}</div>
                      </td>
                      <td>{c.lessonCount}</td>
                      <td>{c.students}</td>
                      <td>
                        <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(c)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(c)}>
                          Delete
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && <p className="muted center">No courses yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
