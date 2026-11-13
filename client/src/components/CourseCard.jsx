import { Link } from 'react-router-dom';
import { fallbackImage, plural, onImgError } from '../utils';

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className="course-card">
      <div className="course-card-img">
        <img
          src={course.imageUrl || fallbackImage(course.title)}
          alt={course.title}
          loading="lazy"
          onError={onImgError(course.title)}
        />
        <span className="badge badge-level">{course.level}</span>
      </div>
      <div className="course-card-body">
        <span className="course-category">{course.category}</span>
        <h3>{course.title}</h3>
        <p className="muted">By {course.instructor}</p>
        <div className="course-meta">
          <span>▶ {plural(course.lessonCount ?? course.lessons?.length ?? 0, 'lesson')}</span>
          <span>👥 {plural(course.students ?? 0, 'student')}</span>
        </div>
      </div>
    </Link>
  );
}
