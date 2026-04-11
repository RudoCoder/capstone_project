import { createContext, useState, useEffect } from "react";
import { loginUser } from "../api/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);

    const access = res.data.access;
    const refresh = res.data.refresh;
    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);

    setToken(access);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
