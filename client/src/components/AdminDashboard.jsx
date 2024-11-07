// src/components/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if token is expired and auto logout
        const token = sessionStorage.getItem('sessionToken');
        if (!token) {
            navigate('/login');
        } else {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
            if (decodedToken.exp < currentTime) {
                sessionStorage.removeItem('sessionToken');
                navigate('/login');
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('sessionToken'); // Remove token from sessionStorage
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! Here you can manage users and view reports.</p>
            {/* Add admin functionalities here */}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default AdminDashboard;
