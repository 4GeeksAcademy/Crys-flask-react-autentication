import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

/* PRUEBA EN CODESPACE: console.log para confirmar URL y respuesta */
export const Login = () => {
  const { dispatch } = useGlobalReducer();
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
    try {
      const res = await fetch(`${BASE}/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      console.log("PRUEBA EN CODESPACE -> fetch status:", res.status, "url:", res.url); // PRUEBA EN CODESPACE
      const data = await res.json();

      if (res.status === 200 && data.token) {
        dispatch({ type: "login", payload: { token: data.token, user_id: data.user_id } });
        navigate("/private");
      } else {
        setError(data?.msg || "Bad credentials");
      }
    } catch (err) {
      setError(err.message || "Network error");
      console.error("PRUEBA EN CODESPACE -> fetch error:", err); // PRUEBA EN CODESPACE
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 480 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" required className="form-control"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" required className="form-control"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Logging..." : "Login"}
        </button>
      </form>
    </div>
  );
};
