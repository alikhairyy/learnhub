import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Spinner from '../components/Spinner.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { toEmbedUrl } from '../utils';

export default function LessonPlayer() {
  const { id, lessonIndex } = useParams();
  const index = Number(lessonIndex) || 0;
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [enrolled, setEnrolled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/courses/${id}`), api.get(`/enroll/${id}`)])
      .then(([c, s]) => {
        setCourse(c.data);
        setEnrolled(s.data.enrolled);
        setCompleted(s.data.completedLessons);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <div className="container section alert alert-error">{error}</div>;
  if (!enrolled) return <Navigate to={`/courses/${id}`} replace />;

  const lessons = course.lessons;
  const lesson = lessons[index];
  if (!lesson) return <Navigate to={`/courses/${id}`} replace />;

  const isDone = completed.includes(lesson._id);
  const progress = Math.round((lessons.filter((l) => completed.includes(l._id)).length / lessons.length) * 100);
  const embed = toEmbedUrl(lesson.videoUrl);

  const toggleComplete = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/progress/${id}`, { lessonId: lesson._id, completed: !isDone });
      setCompleted(res.data.completedLessons);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="player-layout">
      {/* Main video column */}
      <section className="player-main">
        <div className="video-frame">
          {embed ? (
            <iframe
              key={lesson._id}
              src={embed}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video key={lesson._id} src={lesson.videoUrl} controls />
          )}
        </div>

        <div className="player-info">
          <div>
            <p className="muted">
              <Link to={`/courses/${id}`}>{course.title}</Link> · Lesson {index + 1} of {lessons.length}
            </p>
            <h1>{lesson.title}</h1>
          </div>
          <button className={`btn ${isDone ? 'btn-success' : 'btn-primary'}`} onClick={toggleComplete} disabled={saving}>
            {isDone ? '✓ Completed' : 'Mark as complete'}
          </button>
        </div>

        <div className="player-nav">
          {index > 0 ? (
            <Link to={`/courses/${id}/learn/${index - 1}`} className="btn btn-outline">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {index < lessons.length - 1 ? (
            <Link to={`/courses/${id}/learn/${index + 1}`} className="btn btn-primary">
              Next lesson →
            </Link>
          ) : (
            <Link to="/my-courses" className="btn btn-accent">
              Back to dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Sidebar with lesson list */}
      <aside className="player-sidebar">
        <h3>Course content</h3>
        <p className="muted">{progress}% complete</p>
        <ProgressBar value={progress} />
        <ol className="lesson-list compact">
          {lessons.map((l, i) => (
            <li key={l._id}>
              <Link to={`/courses/${id}/learn/${i}`} className={`lesson-row ${i === index ? 'active' : ''}`}>
                <span className={`lesson-num ${completed.includes(l._id) ? 'done' : ''}`}>
                  {completed.includes(l._id) ? '✓' : i + 1}
                </span>
                <span className="lesson-title">{l.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
