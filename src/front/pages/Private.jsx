import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

export const Private = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = store.token || sessionStorage.getItem("token");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const resp = await fetch(`${BASE}/api/private`, {
          headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }
        });

        if (resp.status === 200) {
          const data = await resp.json();
          setUserData(data);
        } else {
          sessionStorage.removeItem("token");
          dispatch({ type: "logout" });
          navigate("/login");
        }
      } catch (err) {
        dispatch({ type: "logout" });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token, navigate, dispatch]);

  if (loading) return <div className="magic-main-container"><div className="spinner-border text-gold"></div></div>;

  return (
    <div className="magic-main-container text-center">
      <div className="magic-card" style={{borderColor: 'var(--neon-blue)'}}>
        <h2 className="magic-title" style={{color: 'var(--neon-blue)'}}>Private Area</h2>
        {userData ? (
          <div className="p-3 bg-black-50 rounded border border-secondary text-start">
            <p className="mb-2"><strong className="text-blue">ID:</strong> <span className="text-light">{userData.id}</span></p>
            <p className="mb-0"><strong className="text-blue">Email:</strong> <span className="text-light">{userData.email}</span></p>
          </div>
        ) : (
          <div className="alert alert-warning">No user info</div>
        )}
      </div>
    </div>
  );
};