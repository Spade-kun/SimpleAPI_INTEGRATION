// src/components/UserDashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if token is expired and auto logout
        const token = localStorage.getItem('sessionToken');
        if (!token) {
            navigate('/login');
        } else {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('sessionToken');
                navigate('/login');
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('sessionToken'); // Remove token from localStorage
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>User Dashboard</h1>
            <p>Welcome, User! Here you can view your requests and manage your profile.</p>
            {/* Add user functionalities here */}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default UserDashboard;
