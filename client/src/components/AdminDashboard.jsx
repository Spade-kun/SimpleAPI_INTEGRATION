import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component'; // Import DataTable

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    // Fetch all users from the backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/users/'); // Replace with your actual API endpoint
                setUsers(response.data); // Store users in state
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on the search term
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())  // Filter by email
    );

    // Data table columns configuration
    const columns = [
        {
            name: 'UserID',
            selector: row => row.userID,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Role',
            selector: row => row.role,
            sortable: true,
        },
        {
            name: 'Department',
            selector: row => row.department,
            sortable: true,
        },
        {
            name: 'Actions',
            button: true,
            cell: row => (
                <div>
                    {/* Add Edit and Delete actions here */}
                    <button>Edit</button>
                    <button>Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! Here you can manage users and view reports.</p>

            {/* Button to add user */}
            <button onClick={() => navigate('/add-user')}>Add User</button>

            {/* Search bar */}
            <input
                type="text"
                placeholder="Search by Email"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ margin: '20px 0', padding: '8px', width: '300px' }}
            />

            {/* DataTable component */}
            <DataTable
                title="Users List"
                columns={columns}
                data={filteredUsers}  // Use filtered users
                pagination
                search
                highlightOnHover
                striped
            />

            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default AdminDashboard;
