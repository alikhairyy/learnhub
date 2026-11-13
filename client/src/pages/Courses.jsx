import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import CourseCard from '../components/CourseCard.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(params.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const category = params.get('category') || 'All';
  const query = params.get('search') || '';

  useEffect(() => {
    api.get('/courses/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Re-fetch whenever the URL filters change
  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/courses', { params: { search: query || undefined, category: category !== 'All' ? category : undefined } })
      .then((res) => setCourses(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [query, category]);

  const updateParams = (next) => {
    const merged = { search: query, category, ...next };
    const clean = {};
    if (merged.search) clean.search = merged.search;
    if (merged.category && merged.category !== 'All') clean.category = merged.category;
    setParams(clean);
  };

  const onSearch = (e) => {
    e.preventDefault();
    updateParams({ search: search.trim() });
  };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>All courses</h1>
          <p>Find the right course for you and start learning today.</p>
          <form className="search-bar" onSubmit={onSearch}>
            <input
              type="search"
              placeholder="Search by title, topic or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-accent">Search</button>
          </form>
        </div>
      </section>

      <section className="container section">
        <div className="chips">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              className={`chip ${cat === category ? 'chip-active' : ''}`}
              onClick={() => updateParams({ category: cat })}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner text="Loading courses..." />
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : courses.length === 0 ? (
          <div className="empty">
            <p>No courses match your search.</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch('');
                setParams({});
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="muted results-count">
              Showing {courses.length} course{courses.length !== 1 && 's'}
            </p>
            <div className="course-grid">
              {courses.map((c) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
