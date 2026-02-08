import React, { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();

  const loadMessage = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined");
      const response = await fetch(backendUrl + "/api/hello");
      const data = await response.json();
      if (response.ok) dispatch({ type: "set_hello", payload: data.message });
      return data;
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    loadMessage();
  }, []);

  return (
    <div className="magic-main-container text-center">
      <div className="magic-card mx-auto">
        <h1 className="magic-title">Project Status</h1>
        <div className="magic-separator mb-4"></div>
        <div className="p-3 bg-black-50 rounded border border-secondary shadow-sm">
          {store.message ? (
            <span className="text-light opacity-75">{store.message}</span>
          ) : (
            <span className="text-danger small">
              Establishing connection with neural backend...
            </span>
          )}
        </div>
        <p className="small mt-4" style={{ color: "#d1d1d1", opacity: "0.8" }}>
          <i className="fa-solid fa-circle-check text-gold me-2"></i>
          Authentication System Online
        </p>
      </div>
    </div>
  );
};