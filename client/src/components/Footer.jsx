import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-light">
            <img src="/logo.svg" alt="" width="30" height="30" />
            <span>
              Learn<b>Hub</b>
            </span>
          </div>
          <p className="muted-light">Free video courses to help you learn web development, one lesson at a time.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/courses">All courses</Link>
          <Link to="/my-courses">My learning</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} LearnHub · DPRG507 Advanced Full Stack Web Development Project
      </div>
    </footer>
  );
}
