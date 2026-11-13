import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/courses', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <img src="https://picsum.photos/seed/learnhub-register/600/800" alt="" />
        <div className="auth-side-text">
          <h2>Start learning today</h2>
          <p>Create a free account to enroll in courses and track your progress.</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Full name
          <input name="name" value={form.name} onChange={onChange} required autoComplete="name" />
        </label>
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
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm password
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={onChange}
            required
            autoComplete="new-password"
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}
