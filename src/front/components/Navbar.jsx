import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Backend logout opcional: si quieres llamar al endpoint /api/logout, hazlo aquí.
    // Pero siempre borra token local y actualiza estado.
    dispatch({ type: "logout" });
    navigate("/login");
  };

  const isLogged = !!store.token;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">Auth App</Link>

        <div className="d-flex gap-2">
          {!isLogged && (
            <>
              <Link to="/signup"><button className="btn btn-outline-light btn-sm">Signup</button></Link>
              <Link to="/login"><button className="btn btn-primary btn-sm">Login</button></Link>
            </>
          )}

          {isLogged && (
            <>
              <Link to="/private"><button className="btn btn-success btn-sm">Private</button></Link>
              <button onClick={handleLogout} className="btn btn-outline-warning btn-sm">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
