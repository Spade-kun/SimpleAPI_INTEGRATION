// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const isAuthenticated = localStorage.getItem('authToken'); // Check if user is logged in
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); // Get user info from localStorage

    // Check if user is authenticated and has a role
    if (!isAuthenticated || !userInfo) {
        return <Navigate to="/login" />;
    }

    // Redirect based on role
    if (userInfo.role === 'admin') {
        return children; // Allow access to the admin component
    } else if (userInfo.role === 'user') {
        return children; // Allow access to the user component
    }

    // Reject login if no valid role
    return <Navigate to="/login" />;
}

export default ProtectedRoute;
