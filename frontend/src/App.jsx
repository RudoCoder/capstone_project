import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// Importing your pages with the correct file names from your 'ls' output
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AnalysisPage from "./pages/AnalysisPage";
import UploadPage from "./pages/UploadPage";
import TutorialsPage from "./pages/TutorialsPage";

/**
 * ProtectedRoute Component
 * This checks if a 'access_token' exists in localStorage.
 * If not, it redirects the user to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes - Only accessible after successful Django login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis/:id"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutorials"
          element={
            <ProtectedRoute>
              <TutorialsPage />
            </ProtectedRoute>
          }
        />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
