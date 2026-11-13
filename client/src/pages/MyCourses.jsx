import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { fallbackImage, onImgError } from '../utils';

export default function MyCourses() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/my-courses')
      .then((res) => setItems(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const completedCourses = items.filter((i) => i.progress === 100).length;
  const avg = items.length ? Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length) : 0;

  return (
    <div className="dashboard container section">
      <div className="dash-header">
        <div>
          <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">Here is your learning progress.</p>
        </div>
        <Link to="/courses" className="btn btn-primary">
          + Find a course
        </Link>
      </div>

      {/* Summary tiles (dashboard layout) */}
      <div className="tiles">
        <div className="tile">
          <span className="tile-label">Enrolled</span>
          <strong>{items.length}</strong>
        </div>
        <div className="tile">
          <span className="tile-label">Completed</span>
          <strong>{completedCourses}</strong>
        </div>
        <div className="tile">
          <span className="tile-label">Average progress</span>
          <strong>{avg}%</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <div className="empty">
          <img src="https://picsum.photos/seed/learnhub-empty/400/240" alt="" />
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn btn-accent">
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="my-list">
          {items.map(({ enrollmentId, course, progress, completedCount }) => (
            <div className="my-item" key={enrollmentId}>
              <img
                src={course.imageUrl || fallbackImage(course.title)}
                alt={course.title}
                onError={onImgError(course.title)}
              />
              <div className="my-item-body">
                <span className="course-category">{course.category}</span>
                <h3>
                  <Link to={`/courses/${course._id}`}>{course.title}</Link>
                </h3>
                <p className="muted">
                  {Math.min(completedCount, course.lessonCount)} of {course.lessonCount} lessons · {progress}%
                </p>
                <ProgressBar value={progress} />
              </div>
              <Link to={`/courses/${course._id}`} className="btn btn-outline">
                {progress === 100 ? 'Review' : 'Continue'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
