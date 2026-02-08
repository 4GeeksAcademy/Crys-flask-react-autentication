import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const res = await fetch(`${BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await res.json();

      if (res.status === 201) {
        navigate("/login");
      } else {
        setError(data?.msg || "Signup failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="magic-main-container">
      <div className="magic-card">
        <h2 className="magic-title">Signup</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <div className="mb-3">
            <label className="magic-label">Email</label>
            <input type="email" required className="form-control magic-input"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

           <div className="mb-4">
            <label className="magic-label">
              Password <span className="text-gold" style={{ fontSize: '0.7rem' }}>(6 min)</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="form-control magic-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="magic-btn-main" disabled={busy}>
            {busy ? "Creating identity..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};