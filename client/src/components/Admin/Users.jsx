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

// Add these custom styles for the modal
const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
  },
};

function Users() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
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
  const [editingUsers, setEditingUsers] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [lockTimer, setLockTimer] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();

  // Fetch users and admins whenever the component mounts or when a user is added/updated
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost:3000/admins/");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  // Fetch the current editing status periodically
  const fetchEditingStatus = async () => {
    try {
      const response = await axios.get("http://localhost:3000/lock/edit_user");
      if (response.data.isLocked && response.data.userID) {
        setEditingUserId(response.data.userID);
      } else {
        setEditingUserId(null);
      }
    } catch (error) {
      console.error("Error fetching editing status:", error);
    }
  };

  useEffect(() => {
    fetchEditingStatus();
    const intervalId = setInterval(fetchEditingStatus, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

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
    fetchUsers();
    fetchAdmins();
  }, []);

  // Function to handle auto-unlock
  const startLockTimer = () => {
    if (lockTimer) {
      clearTimeout(lockTimer);
    }

    const timer = setTimeout(async () => {
      try {
        await axios.patch(`http://localhost:3000/lock/edit_user`, {
          isLocked: false,
          userID: null
        });
        setEditingUserId(null);
        setIsEditModalOpen(false);

        Swal.fire({
          icon: 'info',
          title: 'Lock Expired',
          text: 'The edit lock has expired due to inactivity.',
          background: '#fff',
        });
      } catch (error) {
        console.error('Error releasing lock:', error);
      }
    }, 3 * 60 * 1000); // Changed to 3 minutes

    setLockTimer(timer);
  };

  const handleEditUser = async (user) => {
    try {
      const id = user.userID || user.adminID;
      const response = await axios.get(`http://localhost:3000/lock/edit_user`);

      if (response.data.isLocked && response.data.userID !== id) {
        // Calculate remaining time if lock exists
        const lockTime = new Date(response.data.lockTime);
        const currentTime = new Date();
        const remainingMinutes = Math.ceil((3 * 60 * 1000 - (currentTime - lockTime)) / 1000 / 60);

        Swal.fire({
          icon: 'warning',
          title: 'Locked!',
          text: `Another admin is currently editing a user. Please wait. Lock expires in ${remainingMinutes} minutes.`,
          background: '#fff',
        });
        return;
      }

      await axios.patch(`http://localhost:3000/lock/edit_user`, {
        isLocked: true,
        userID: id
      });

      // Store the original role when setting up edit
      setEditUser({ ...user, originalRole: user.role });
      setEditingUserId(id);
      setIsEditModalOpen(true);

      startLockTimer();

    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  };

  // Modified confirmEditUser function
  const confirmEditUser = async () => {
    try {
      const id = editUser.userID || editUser.adminID;

      // If role is changing
      if (editUser.role !== editUser.originalRole) {
        let newData = {
          email: editUser.email,
          name: editUser.name,
          department: editUser.department,
          role: editUser.role,
          transferFromId: id,  // Add this to indicate it's a transfer
          originalRole: editUser.originalRole  // Add this to indicate the original role
        };

        if (editUser.role === "admin") {
          // Converting from user to admin
          // First, create new admin
          const adminResponse = await axios.post('http://localhost:3000/admins/transfer', newData);
          if (adminResponse.data.success) {
            // Then delete the user
            await axios.delete(`http://localhost:3000/users/${id}`);
          }
        } else if (editUser.role === "user") {
          // Converting from admin to user
          // First, create new user
          const userResponse = await axios.post('http://localhost:3000/users/transfer', newData);
          if (userResponse.data.success) {
            // Then delete the admin
            await axios.delete(`http://localhost:3000/admins/${id}`);
          }
        }
      } else {
        // If role is not changing, just update the existing record
        const endpoint = editUser.role === "admin"
          ? `http://localhost:3000/admins/${id}`
          : `http://localhost:3000/users/${id}`;

        await axios.patch(endpoint, editUser);
      }

      // Clear the lock timer and release the lock
      if (lockTimer) {
        clearTimeout(lockTimer);
        setLockTimer(null);
      }
      await axios.patch(`http://localhost:3000/lock/edit_user`, {
        isLocked: false,
        userID: null
      });

      setIsEditModalOpen(false);
      setEditingUserId(null);
      setEditUser(null);

      // Refresh both tables
      fetchUsers();
      fetchAdmins();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Successfully changed role to ${editUser.role}!`,
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to update user.",
        background: "#fff",
      });
    }
  };

  // Modified cancelEditUser function
  const cancelEditUser = async () => {
    try {
      // Clear the lock timer
      if (lockTimer) {
        clearTimeout(lockTimer);
        setLockTimer(null);
      }

      // Release the lock
      await axios.patch(`http://localhost:3000/lock/edit_user`, {
        isLocked: false,
        userID: null
      });

      setIsEditModalOpen(false);
      setEditingUserId(null);
      setEditUser(null);
    } catch (error) {
      console.error('Error canceling edit:', error);
    }
  };

  const handleDeleteUser = async (user) => {
    // Check if user is being edited first
    if (editingUserId !== null) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete',
        text: 'This user is currently being edited. Please wait until editing is complete.',
        background: '#fff',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        background: "#fff",
      });

      if (result.isConfirmed) {
        const id = user.userID || user.adminID;
        const endpoint = user.role === "admin"
          ? `http://localhost:3000/admins/${id}`
          : `http://localhost:3000/users/${id}`;

        await axios.delete(endpoint);
        fetchUsers();
        fetchAdmins();

        Swal.fire({
          title: "Deleted!",
          text: "User has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#fff",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to delete user.",
        background: "#fff",
      });
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate required fields
      if (!newUser.email || !newUser.name || !newUser.role || !newUser.department) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: "Please fill in all required fields.",
          background: "#fff",
        });
        return;
      }

      // Choose endpoint based on role
      const endpoint = newUser.role === "admin"
        ? "http://localhost:3000/admins/register"
        : "http://localhost:3000/users/register";

      const response = await axios.post(endpoint, newUser);

      if (response.data) {
        setIsAddModalOpen(false);
        // Reset the newUser state
        setNewUser({
          email: "",
          name: "",
          role: "",
          department: ""
        });

        // Refresh the tables
        fetchUsers();
        fetchAdmins();

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${newUser.role === "admin" ? "Admin" : "User"} added successfully!`,
          timer: 1500,
          showConfirmButton: false,
          background: "#fff",
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to add user.",
        background: "#fff",
      });
    }
  };

  const renderActionButtons = (row) => {
    const id = row.userID || row.adminID;
    const isLocked = editingUserId !== null;
    const isCurrentlyEditing = editingUserId === id;
    const isBeingEdited = isLocked && editingUserId === id;

    return (
      <div className="action-buttons">
        {isLocked ? (
          <button
            className="lock-icon-btn"
            disabled
            title={isCurrentlyEditing ? "You are currently editing this user" : "Another admin is editing a user"}
          >
            🔒
          </button>
        ) : (
          <button
            onClick={() => handleEditUser(row)}
            className="custom-btn2"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => handleDeleteUser(row)}
          className="custom-btn1"
          disabled={isLocked} // Disable delete button when any user is being edited
          style={{
            opacity: isLocked ? 0.5 : 1,
            cursor: isLocked ? 'not-allowed' : 'pointer'
          }}
        >
          Delete
        </button>
        {isBeingEdited && (
          <span className="editing-indicator" title="Currently being edited">
            ✏️
          </span>
        )}
      </div>
    );
  };

  const columns = [
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Role", selector: (row) => row.role, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    {
      name: "Actions",
      cell: renderActionButtons,
    },
  ];

  const userColumns = [
    { name: "UserID", selector: (row) => row.userID, sortable: true },
    ...columns,
  ];

  const adminColumns = [
    { name: "AdminID", selector: (row) => row.adminID, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Role", selector: (row) => row.role, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    {
      name: "Actions",
      cell: renderActionButtons,
    },
  ];

  const roleOptions = ["admin", "user"];
  const departmentOptions = [
    "College of Technologies",
    "College of Education",
    "College of Nursing",
    "College of Public Administration",
    "College of Arts and Science",
    "College of Business",
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

      <div className="admin-container">
        <AdminSidebar isOpen={isSidebarOpen} />

        <div
          className={`admin-content ${isSidebarOpen ? "with-sidebar" : "without-sidebar"
            }`}
          style={{ overflowY: "auto", maxHeight: "100vh" }}
        >
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! Here you can manage users and view reports.</p>
          </div>

          <div className="admin-controls">
            <button onClick={() => setIsAddModalOpen(true)} className="custom-btn">
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

          <div className="scrollable-table-container">
            <div className="table-section">
              <h2>Admins</h2>
              <DataTable
                columns={adminColumns}
                data={admins.filter((admin) =>
                  admin.email.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                pagination
                highlightOnHover
                striped
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 350px)"
              />
            </div>

            <div className="table-section">
              <h2>Users</h2>
              <DataTable
                columns={userColumns}
                data={users.filter(
                  (user) =>
                    user.role === "user" &&
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                pagination
                highlightOnHover
                striped
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 350px)"
              />
            </div>
          </div>

          {/* Edit Modal */}
          {isEditModalOpen && (
            <Modal
              isOpen={isEditModalOpen}
              onRequestClose={cancelEditUser}
              style={customStyles}
              className="modal-content"
            >
              <h2>Edit User</h2>
              <div className="modal-form">
                <input
                  type="text"
                  placeholder="Email"
                  value={editUser.email}
                  disabled  // Email field is now disabled
                  className="disabled-input"  // Add this class for styling
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                />
                <select
                  className="select-dropdown"
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                >
                  <option value="">Select Role</option>
                  {roleOptions.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <select
                  className="select-dropdown"
                  value={editUser.department}
                  onChange={(e) =>
                    setEditUser({ ...editUser, department: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="modal-buttons">
                  <button onClick={confirmEditUser} className="custom-btn">
                    Confirm
                  </button>
                  <button onClick={cancelEditUser} className="custom-btn1">
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
              style={customStyles}
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
                <select
                  className="select-dropdown"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="">Select Role</option>
                  {roleOptions.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <select
                  className="select-dropdown"
                  value={newUser.department}
                  onChange={(e) =>
                    setNewUser({ ...newUser, department: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="modal-buttons">
                  <button onClick={handleAddUser} className="custom-btn">
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="custom-btn1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;
