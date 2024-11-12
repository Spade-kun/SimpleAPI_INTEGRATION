import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import "./components-css/AdminDashboard.css";
import Sidebar from "./Sidebar/AdminSidebar";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "",
    department: "",
  });
  const navigate = useNavigate();

  // Fetch users whenever the component mounts or when a user is added/updated
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Initial fetch of users
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("sessionToken");
    navigate("/login");
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  const confirmEditUser = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/users/${editUser.userID}`,
        editUser
      );
      fetchUsers(); // Fetch updated list after edit
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userID) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:3000/users/${userID}`);
        fetchUsers(); // Fetch updated list after deletion
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleAddUser = () => {
    setNewUser({ email: "", name: "", role: "", department: "" });
    setIsAddModalOpen(true);
  };

  const confirmAddUser = async () => {
    try {
      await axios.post("http://localhost:3000/users/register", newUser);
      fetchUsers(); // Fetch updated list after adding user
      setIsAddModalOpen(false); // Close modal after adding user
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const columns = [
    { name: "UserID", selector: (row) => row.userID, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Role", selector: (row) => row.role, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button onClick={() => handleEditUser(row)}>Edit</button>
          <button onClick={() => handleDeleteUser(row.userID)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-container">
        {/* Your existing content stays exactly the same */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, Admin! Here you can manage users and view reports.</p>
        </div>

        <div className="admin-controls">
          <button onClick={handleAddUser}>Add User</button>
          <input
            type="text"
            placeholder="Search by Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="table-container">
          <DataTable
            title="Users List"
            columns={columns}
            data={users.filter((user) =>
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            pagination
            highlightOnHover
            striped
          />
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <Modal
            isOpen={isEditModalOpen}
            onRequestClose={() => setIsEditModalOpen(false)}
            className="modal-content"
          >
            <h2>Edit User</h2>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Name"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Role"
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Department"
                value={editUser.department}
                onChange={(e) =>
                  setEditUser({ ...editUser, department: e.target.value })
                }
              />
              <div className="modal-buttons">
                <button onClick={confirmEditUser}>Confirm</button>
                <button onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <Modal
            isOpen={isAddModalOpen}
            onRequestClose={() => setIsAddModalOpen(false)}
            className="modal-content"
          >
            <h2>Add User</h2>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Role"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Department"
                value={newUser.department}
                onChange={(e) =>
                  setNewUser({ ...newUser, department: e.target.value })
                }
              />
              <div className="modal-buttons">
                <button onClick={confirmAddUser}>Confirm</button>
                <button onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
