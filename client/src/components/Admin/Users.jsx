import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../Sidebar/AdminSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import "../components-css/AdminUsers.css";

Modal.setAppElement("#root");

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "",
    department: "",
  });
  const [loading, setLoading] = useState(true);

  const departments = [
    "College of Technology",
    "College of Nursing",
    "College of Business",
    "College of Education",
    "College of Law",
    "College of Public Administration and Governance",
    "College of Arts and Science"
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();

  // Fetch users whenever the component mounts or when a user is added/updated
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('sessionToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log("Making API request...");
      const response = await axios.get("http://localhost:3000/api/users", config);
      console.log("API Response:", response.data);
      
      if (response.data && response.data.data) {
        const userData = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("Setting users state:", userData);
        setUsers(userData);
      } else {
        setUsers([]);
        toast.error('Failed to fetch users data');
      }
    } catch (error) {
      console.error("Error fetching users:", error.response || error);
      setUsers([]);
      if (error.response?.status === 401) {
        sessionStorage.clear();
        navigate('/login');
      }
      toast.error('Error loading users data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userInfo = sessionStorage.getItem("userInfo");
    const welcomeShown = localStorage.getItem("welcomeShown");

    if (userInfo && welcomeShown !== "true") {
      const user = JSON.parse(userInfo);
      Swal.fire({
        icon: "success",
        title: `Welcome Admin ${user.name}! 👋`,
        showConfirmButton: false,
        timer: 1500,
        background: "#fff",
        customClass: {
          popup: "animated fadeInDown",
        },
      });
      // Set the flag in localStorage
      localStorage.setItem("welcomeShown", "true");
    }
    
    console.log("Fetching users..."); // Debug log
    fetchUsers();
  }, [navigate]);

  const handleEditUser = (user) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  const confirmEditUser = async () => {
    try {
      const token = sessionStorage.getItem('sessionToken');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Changed endpoint to match the API pattern
      await axios.patch(
        `http://localhost:3000/api/users/${editUser.userID}`,
        editUser,
        config
      );
      
      fetchUsers();
      setIsEditModalOpen(false);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userID) => {
    // Show confirmation dialog first
    const result = await Swal.fire({
      title: 'Delete User',
      text: 'Are you sure you want to delete this user? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    // Only proceed if user confirmed
    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('sessionToken');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        await axios.delete(`http://localhost:3000/api/users/${userID}`, config);
        
        fetchUsers();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete user'
        });
      }
    }
  };

  const handleAddUser = () => {
    setNewUser({ email: "", name: "", role: "", department: "" });
    setIsAddModalOpen(true);
  };

  const confirmAddUser = async () => {
    try {
      if (!newUser.email || !newUser.name || !newUser.role || !newUser.department) {
        toast.error("All fields are required");
        return;
      }

      const token = sessionStorage.getItem('sessionToken');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Changed endpoint to match the get endpoint
      await axios.post("http://localhost:3000/api/users", newUser, config);
      
      fetchUsers();
      setIsAddModalOpen(false);
      toast.success("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
    }
  };

  const columns = [
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Role", selector: (row) => row.role, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button onClick={() => handleEditUser(row)} className="custom-btn2">
            Edit
          </button>
          <button onClick={() => handleDeleteUser(row.userID)} className="custom-btn1">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-layout">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <button className="hamburger-icon" onClick={toggleSidebar}>
        <List size={24} />
      </button>

      <AdminSidebar isOpen={isSidebarOpen} />

      <div
        className={`admin-container ${
          isSidebarOpen ? "with-sidebar" : "without-sidebar"
        }`}
      >
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, Admin! Here you can manage users and view reports.</p>
        </div>

        <div className="admin-controls">
          <button onClick={handleAddUser} className="custom-btn">
            Add User
          </button>
          <input
            type="text"
            placeholder="Search by Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-container">
          <DataTable
            columns={columns}
            data={Array.isArray(users) ? users.filter((user) =>
              user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            ) : []}
            pagination
            progressPending={loading}
            progressComponent={<div>Loading...</div>}
            noDataComponent={<div>No users found</div>}
            highlightOnHover
            striped
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 350px)"
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
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="modal-select"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select
                value={editUser.department}
                onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                className="modal-select"
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <div className="modal-buttons">
                <button onClick={confirmEditUser} className="custom-btn">
                  Save Changes
                </button>
                <button onClick={() => setIsEditModalOpen(false)} className="custom-btn1">
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
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="modal-select"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                className="modal-select"
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <div className="modal-buttons">
                <button onClick={confirmAddUser} className="custom-btn">
                  Add User
                </button>
                <button onClick={() => setIsAddModalOpen(false)} className="custom-btn1">
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Users;
