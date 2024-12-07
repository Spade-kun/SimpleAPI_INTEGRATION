// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import UserDocuments from "./components/User/UserDocuments";
import RequestHistory from "./components/User/RequestHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./components/User/Notifications";
import RequestsDocument from "./components/Admin/RequestsDocument";
import Users from "./components/Admin/Users";
import ArchiveDocuments from "./components/User/ArchiveDocuments";
import AdminNotifications from "./components/Admin/AdminNotifications";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests-document"
        element={
          <ProtectedRoute role="admin">
            <RequestsDocument />
          </ProtectedRoute>
        }
      />
      <Route
        path="/displayUsers"
        element={
          <ProtectedRoute role="admin">
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-notifications"
        element={
          <ProtectedRoute role="admin">
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute role="user">
            <UserDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/archive-documents"
        element={
          <ProtectedRoute role="user">
            <ArchiveDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/request-history"
        element={
          <ProtectedRoute role="user">
            <RequestHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute role="user">
            <Notifications />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
