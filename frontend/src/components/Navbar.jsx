import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on entry page
  if (location.pathname === "/") {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600">Store Rating App</Link>
      <div className="flex items-center gap-4">
        {!user && (
          <>
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
          </>
        )}
        {user && (
          <>
            {user.role === "Admin" && (
              <Link to="/dashboard/admin" className="text-blue-600 hover:underline">Admin Dashboard</Link>
            )}
            {user.role === "Owner" && (
              <Link to="/dashboard/owner" className="text-blue-600 hover:underline">Owner Dashboard</Link>
            )}
            {user.role === "User" && (
              <Link to="/dashboard/user" className="text-blue-600 hover:underline">User Dashboard</Link>
            )}
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
} 