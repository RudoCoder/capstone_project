import { createContext, useState, useEffect } from "react";
import { loginUser } from "../api/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);

    const access = res.data.access;
    localStorage.setItem("token", access);

    setToken(access);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
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
