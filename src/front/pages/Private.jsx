import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

export const Private = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = store.token || (typeof window !== "undefined" && sessionStorage.getItem("token"));

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
          // token inválido o revocado
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h2>Private area</h2>
      {userData ? (
        <div className="card">
          <div className="card-body">
            <p><strong>ID:</strong> {userData.id}</p>
            <p><strong>Email:</strong> {userData.email}</p>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">No user info</div>
      )}
    </div>
  );
};
