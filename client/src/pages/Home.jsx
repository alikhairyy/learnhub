import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import CourseCard from '../components/CourseCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { icon: '🎬', title: 'Video lessons', text: 'Short, focused video lessons you can watch at your own pace.' },
  { icon: '📈', title: 'Track progress', text: 'Mark lessons complete and watch your progress bar fill up.' },
  { icon: '🧭', title: 'Clear paths', text: 'Courses grouped by category and level so you know where to start.' },
];

export default function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(res.data))
      .catch(() => setCourses([]));
  }, []);

  const totalLessons = courses.reduce((sum, c) => sum + (c.lessonCount || 0), 0);
  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <>
      {/* ---------- Hero (full-width banner layout) ---------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <span className="eyebrow">Learn. Build. Grow.</span>
            <h1>
              Learn new skills with <span className="highlight">free video courses</span>
            </h1>
            <p>
              LearnHub brings together hand-picked video courses on web development, programming and databases. Enroll
              for free and track your progress lesson by lesson.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-accent btn-lg">
                Browse courses
              </Link>
              {!user && (
                <Link to="/register" className="btn btn-ghost btn-lg">
                  Create free account
                </Link>
              )}
            </div>
          </div>
          <div className="hero-image">
            <img src="https://picsum.photos/seed/learnhub-hero/720/540" alt="Students learning online" />
          </div>
        </div>
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="container stats">
        <div className="stat">
          <strong>{courses.length}</strong>
          <span>Courses</span>
        </div>
        <div className="stat">
          <strong>{totalLessons}</strong>
          <span>Video lessons</span>
        </div>
        <div className="stat">
          <strong>{categories.length}</strong>
          <span>Categories</span>
        </div>
        <div className="stat">
          <strong>100%</strong>
          <span>Free</span>
        </div>
      </section>

      {/* ---------- Featured courses (grid layout) ---------- */}
      <section className="container section">
        <div className="section-head">
          <div>
            <h2>Featured courses</h2>
            <p className="muted">Start with one of our most popular courses.</p>
          </div>
          <Link to="/courses" className="link-arrow">
            View all →
          </Link>
        </div>
        <div className="course-grid">
          {courses.slice(0, 3).map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
        {courses.length === 0 && <p className="muted center">No courses yet. Run the seed script to add some.</p>}
      </section>

      {/* ---------- Intro video (two-column layout) ---------- */}
      <section className="section section-alt">
        <div className="container split">
          <div className="video-frame">
            <iframe
              src="https://www.youtube.com/embed/PkZNo7MFNFg?rel=0"
              title="Intro video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div>
            <span className="eyebrow">See how it works</span>
            <h2>Watch, practise, complete</h2>
            <p className="muted">
              Every course is split into short lessons. Watch a lesson, practise what you learned, then mark it as
              complete. Your dashboard keeps track of where you stopped so you can pick up right where you left off.
            </p>
            <Link to="/courses" className="btn btn-primary">
              Start learning
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Features (three-column layout) ---------- */}
      <section className="container section">
        <h2 className="center">Why LearnHub?</h2>
        <div className="features">
          {features.map((f) => (
            <div className="feature" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      {categories.length > 0 && (
        <section className="container section">
          <h2 className="center">Explore by category</h2>
          <div className="chips center">
            {categories.map((cat) => (
              <Link key={cat} to={`/courses?category=${encodeURIComponent(cat)}`} className="chip">
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- CTA banner ---------- */}
      <section className="container">
        <div className="cta">
          <h2>Ready to start learning?</h2>
          <p>Join LearnHub today. It is free and takes less than a minute.</p>
          <Link to={user ? '/courses' : '/register'} className="btn btn-accent btn-lg">
            {user ? 'Find your next course' : 'Get started'}
          </Link>
        </div>
      </section>
    </>
  );
}
