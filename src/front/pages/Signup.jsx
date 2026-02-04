import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

/* PRUEBA EN CODESPACE: mantiene console.log para verificar que BASE apunta al backend */
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

    console.log("PRUEBA EN CODESPACE -> BASE:", BASE); // PRUEBA EN CODESPACE
    console.log("PRUEBA EN CODESPACE -> payload:", { email: email.trim().toLowerCase(), password }); // PRUEBA EN CODESPACE

    try {
      const res = await fetch(`${BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      console.log("PRUEBA EN CODESPACE -> fetch status:", res.status, "url:", res.url); // PRUEBA EN CODESPACE
      const data = await res.json();

      if (res.status === 201) {
        navigate("/login");
      } else {
        setError(data?.msg || "Signup failed");
      }
    } catch (err) {
      setError(err.message || "Network error");
      console.error("PRUEBA EN CODESPACE -> fetch error:", err); // PRUEBA EN CODESPACE
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" required className="form-control"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password (min 6)</label>
          <input type="password" required minLength={6} className="form-control"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
};
