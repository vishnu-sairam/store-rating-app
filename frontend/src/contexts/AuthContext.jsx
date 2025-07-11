import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, role }
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  // On mount, try to load user from token (optional: implement token validation)
  useEffect(() => {
    if (token && !user) {
      // Optionally, decode token or fetch user info here
      // For now, just set a dummy user if token exists
      setUser({ role: "User" }); // Replace with real user info if available
    }
  }, [token, user]);

  // Login function
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
} 