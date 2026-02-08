import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-magic mb-3">
      <div className="container">
        <Link to="/" className="text-decoration-none">
          <span className="navbar-brand mb-0 h1 text-gold">
            <i className="fa-solid fa-bolt me-2"></i>AUTH Project
          </span>
        </Link>
        <div className="ml-auto">
          {!token ? (
            <Link to="/login">
              <button className="btn-logout-neon">Login</button>
            </Link>
          ) : (
            <div className="d-flex align-items-center gap-2 gap-md-3">
              <Link to="/private" className="nav-link-neon text-decoration-none small">Private Area</Link>
              <button onClick={handleLogout} className="btn-logout-neon">
                <i className="fa-solid fa-power-off"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};