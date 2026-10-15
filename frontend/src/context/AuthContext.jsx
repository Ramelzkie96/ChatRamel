import { createContext, useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check the cookie

  // on page load / refresh: ask the server who is logged in
  useEffect(() => {
    api
      .get("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password, remember }) => {
    const data = await api.post("/auth/login", { email, password, rememberMe: remember });
    setUser(data);
    return data;
  };

  const signup = async ({ name, email, password }) => {
    const data = await api.post("/auth/signup", { name, email, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  // merge new profile data (name, photo, bio...) so the sidebar and footer refresh instantly
  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}