import React from "react";
import { Link, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Single = () => {
  const { store } = useGlobalReducer();
  const { theId } = useParams();
  const singleTodo = store.todos.find(todo => todo.id === parseInt(theId));

  return (
    <div className="magic-main-container text-center">
      <div className="magic-card">
        <h1 className="magic-title mb-2">Todo Detail</h1>
        <p className="lead text-light opacity-75">{singleTodo?.title || "No item found"}</p>
        <div className="magic-separator my-4"></div>
        <Link to="/">
          <button className="magic-btn-main" style={{maxWidth: '200px'}}>
            Back home
          </button>
        </Link>
      </div>
    </div>
  );
};