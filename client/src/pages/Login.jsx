import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const fallback = user.role === 'admin' ? '/admin' : '/my-courses';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <img src="/images/login.svg" alt="" />
        <div className="auth-side-text">
          <h2>Welcome back!</h2>
          <p>Pick up your courses right where you left off.</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Log in</h1>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            autoComplete="current-password"
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>

        <div className="demo-box">
          <strong>Demo accounts</strong>
          <span>Admin: admin@learnhub.com / admin123</span>
          <span>Student: student@learnhub.com / student123</span>
        </div>
      </form>
    </div>
  );
}
