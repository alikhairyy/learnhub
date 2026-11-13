import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section center not-found">
      <h1>404</h1>
      <p className="muted">The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  );
}
