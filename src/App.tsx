import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Requirements from "./pages/Requirements";
import RequirementDetail from "./pages/RequirementDetail";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Simple Protected Route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requirements"
              element={
                <ProtectedRoute>
                  <Requirements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requirements/:id"
              element={
                <ProtectedRoute>
                  <RequirementDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
