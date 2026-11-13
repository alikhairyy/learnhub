import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { fallbackImage, plural, onImgError } from '../utils';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState({ enrolled: false, completedLessons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/enroll/${id}`)
      .then((res) => setStatus(res.data))
      .catch(() => {});
  }, [id, user]);

  const enroll = async () => {
    if (!user) return navigate('/login', { state: { from: `/courses/${id}` } });
    setBusy(true);
    try {
      await api.post(`/enroll/${id}`);
      setStatus({ enrolled: true, completedLessons: [] });
      setCourse((c) => ({ ...c, students: (c.students || 0) + 1 }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const unenroll = async () => {
    if (!window.confirm('Leave this course? Your progress will be lost.')) return;
    setBusy(true);
    try {
      await api.delete(`/enroll/${id}`);
      setStatus({ enrolled: false, completedLessons: [] });
      setCourse((c) => ({ ...c, students: Math.max(0, (c.students || 1) - 1) }));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;
  if (error && !course)
    return (
      <div className="container section center">
        <div className="alert alert-error">{error}</div>
        <Link to="/courses" className="btn btn-outline">
          Back to courses
        </Link>
      </div>
    );

  const lessons = course.lessons || [];
  const done = new Set(status.completedLessons);
  const progress = lessons.length ? Math.round((lessons.filter((l) => done.has(l._id)).length / lessons.length) * 100) : 0;
  // Continue from the first lesson not yet completed
  const nextIndex = Math.max(0, lessons.findIndex((l) => !done.has(l._id)));

  return (
    <>
      {/* Banner */}
      <section className="course-hero">
        <div className="container course-hero-grid">
          <div>
            <nav className="breadcrumb">
              <Link to="/courses">Courses</Link> / <span>{course.category}</span>
            </nav>
            <h1>{course.title}</h1>
            <p className="course-hero-desc">{course.description}</p>
            <div className="course-hero-meta">
              <span className="badge">{course.level}</span>
              <span>👤 {course.instructor}</span>
              <span>▶ {plural(lessons.length, 'lesson')}</span>
              <span>👥 {plural(course.students || 0, 'student')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content + sticky sidebar (two-column layout) */}
      <section className="container course-body">
        <div>
          <h2>Course content</h2>
          <ol className="lesson-list">
            {lessons.map((lesson, i) => {
              const content = (
                <>
                  <span className={`lesson-num ${done.has(lesson._id) ? 'done' : ''}`}>
                    {done.has(lesson._id) ? '✓' : i + 1}
                  </span>
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="muted">{lesson.duration}</span>
                </>
              );
              return (
                <li key={lesson._id}>
                  {status.enrolled ? (
                    <Link to={`/courses/${id}/learn/${i}`} className="lesson-row">
                      {content}
                    </Link>
                  ) : (
                    <div className="lesson-row locked" title="Enroll to watch">
                      {content}
                      <span>🔒</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {lessons.length === 0 && <p className="muted">Lessons are coming soon.</p>}
        </div>

        <aside className="enroll-card">
          <img
            src={course.imageUrl || fallbackImage(course.title)}
            alt={course.title}
            onError={onImgError(course.title)}
          />
          <div className="enroll-card-body">
            {error && <div className="alert alert-error">{error}</div>}
            {status.enrolled ? (
              <>
                <p className="muted">Your progress: {progress}%</p>
                <ProgressBar value={progress} />
                <Link
                  to={`/courses/${id}/learn/${nextIndex}`}
                  className={`btn btn-primary btn-block ${lessons.length === 0 ? 'disabled' : ''}`}
                >
                  {progress === 0 ? 'Start course' : progress === 100 ? 'Review course' : 'Continue learning'}
                </Link>
                <button className="btn btn-link" onClick={unenroll} disabled={busy}>
                  Leave course
                </button>
              </>
            ) : (
              <>
                <p className="price">Free</p>
                <button className="btn btn-accent btn-block" onClick={enroll} disabled={busy}>
                  {busy ? 'Enrolling...' : user ? 'Enroll now' : 'Log in to enroll'}
                </button>
              </>
            )}
            <ul className="includes">
              <li>🎬 {lessons.length} video lessons</li>
              <li>📈 Progress tracking</li>
              <li>♾ Lifetime access</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
