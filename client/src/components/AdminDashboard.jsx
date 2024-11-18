import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import "./components-css/AdminDashboard.css";
import { List } from "react-bootstrap-icons";
import AdminSidebar from "./Sidebar/AdminSidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
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
  }, []);

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
      fetchUsers();
      setIsEditModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User updated successfully!",
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
        customClass: {
          popup: "animated fadeInDown",
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update user.",
        background: "#fff",
      });
    }
  };

  const handleDeleteUser = (userID) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      customClass: {
        popup: "animated fadeInDown",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(userID);
      }
    });
  };

  const confirmDelete = async (userID) => {
    try {
      await axios.delete(`http://localhost:3000/users/${userID}`);
      fetchUsers();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "User has been deleted.",
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
        customClass: {
          popup: "animated fadeInDown",
        },
      });
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

  const handleAddUser = () => {
    setNewUser({ email: "", name: "", role: "", department: "" });
    setIsAddModalOpen(true);
  };

  const confirmAddUser = async () => {
    try {
      // Show loading state
      Swal.fire({
        title: "Adding User",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post("http://localhost:3000/users/register", newUser);
      fetchUsers();
      setIsAddModalOpen(false);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "New user added successfully!",
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
        customClass: {
          popup: "animated fadeInDown",
        },
      });
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to add new user.",
        background: "#fff",
      });
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
          <button onClick={() => handleEditUser(row)} className="custom-btn2">
            Edit
          </button>
          <button
            onClick={() => handleDeleteUser(row.userID)}
            className="custom-btn1"
          >
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

      {/* Hamburger Icon */}
      <button className="hamburger-icon" onClick={toggleSidebar}>
        <List size={24} />
      </button>

      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className={`admin-container ${isSidebarOpen ? "with-sidebar" : ""}`}>
        <div className="admin-header">
          <h1 style={{ marginLeft: "10vh" }}>Admin Dashboard</h1>
          <p style={{ marginLeft: "10vh" }}>
            Welcome, Admin! Here you can manage users and view reports.
          </p>
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
            data={users.filter((user) =>
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            pagination
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
                <button onClick={confirmEditUser} className="custom-btn">
                  Confirm
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="custom-btn1"
                >
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
                <button onClick={confirmAddUser} className="custom-btn">
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
  );
}

export default AdminDashboard;
