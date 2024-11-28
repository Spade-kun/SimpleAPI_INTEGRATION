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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();

  // Fetch users and admins whenever the component mounts or when a user is added/updated
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/users/");
      console.log("Fetched Users:", response.data); // Log the fetched users
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost:3000/admins/");
      console.log("Fetched Admins:", response.data); // Log the fetched admins
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
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
    fetchAdmins();
  }, []);

  const handleEditUser = async (user) => {
    try {
      const id = user.userID || user.adminID;
      const response = await axios.get(`http://localhost:3000/lock/edit_user`);
      if (response.data.isLocked) {
        Swal.fire({
          icon: "warning",
          title: "Locked!",
          text: "Another admin is currently editing this user. Please wait.",
          background: "#fff",
        });
        return;
      }

      await axios.patch(`http://localhost:3000/lock/edit_user`, {
        isLocked: true,
        userID: id,
      });
      setEditUser(user);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error checking lock status:", error);
    }
  };

  const confirmEditUser = async () => {
    try {
      const id = editUser.userID || editUser.adminID;
      const endpoint =
        editUser.role === "admin"
          ? `http://localhost:3000/admins/${id}`
          : `http://localhost:3000/users/${id}`;
      await axios.patch(endpoint, editUser);
      fetchUsers();
      fetchAdmins();
      await axios.patch(`http://localhost:3000/lock/edit_user`, {
        isLocked: false,
      });
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

  const cancelEditUser = async () => {
    try {
      await axios.patch(`http://localhost:3000/lock/edit_user`, {
        isLocked: false,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error unlocking edit user:", error);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      const id = user.userID || user.adminID;
      const response = await axios.get(
        `http://localhost:3000/lock/delete_user`
      );
      if (response.data.isLocked) {
        Swal.fire({
          icon: "warning",
          title: "Locked!",
          text: "Another admin is currently deleting this user. Please wait.",
          background: "#fff",
        });
        return;
      }

      await axios.patch(`http://localhost:3000/lock/delete_user`, {
        isLocked: true,
        userID: id,
      });

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
      }).then(async (result) => {
        if (result.isConfirmed) {
          const endpoint =
            user.role === "admin"
              ? `http://localhost:3000/admins/${id}`
              : `http://localhost:3000/users/${id}`;

          try {
            await axios.delete(endpoint);
            fetchUsers();
            fetchAdmins();
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
          } catch (deleteError) {
            console.error(
              "Error deleting user:",
              deleteError.response
                ? deleteError.response.data
                : deleteError.message
            );
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "Failed to delete user.",
              background: "#fff",
            });
          } finally {
            await axios.patch(`http://localhost:3000/lock/delete_user`, {
              isLocked: false,
            });
          }
        } else {
          await axios.patch(`http://localhost:3000/lock/delete_user`, {
            isLocked: false,
          });
        }
      });
    } catch (error) {
      console.error("Error checking lock status:", error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.get("http://localhost:3000/lock/add_user");
      if (response.data.isLocked) {
        Swal.fire({
          icon: "warning",
          title: "Locked!",
          text: "Another admin is currently adding a user. Please wait.",
          background: "#fff",
        });
        return;
      }

      await axios.patch("http://localhost:3000/lock/add_user", {
        isLocked: true,
      });
      setNewUser({ email: "", name: "", role: "", department: "" });
      setIsAddModalOpen(true);
    } catch (error) {
      console.error("Error checking lock status:", error);
    }
  };

  const confirmAddUser = async () => {
    try {
      Swal.fire({
        title: "Adding User",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const endpoint =
        newUser.role === "admin"
          ? "http://localhost:3000/admins/register"
          : "http://localhost:3000/users/register";
      await axios.post(endpoint, newUser);

      if (newUser.role === "admin") {
        fetchAdmins();
      } else {
        fetchUsers();
      }

      await axios.patch("http://localhost:3000/lock/add_user", {
        isLocked: false,
      });
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

  const cancelAddUser = async () => {
    try {
      await axios.patch("http://localhost:3000/lock/add_user", {
        isLocked: false,
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error unlocking add user:", error);
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
          <button onClick={() => handleDeleteUser(row)} className="custom-btn1">
            Delete
          </button>
        </div>
      ),
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
    { name: "Department", selector: (row) => row.department, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button onClick={() => handleEditUser(row)} className="custom-btn2">
            Edit
          </button>
          <button onClick={() => handleDeleteUser(row)} className="custom-btn1">
            Delete
          </button>
        </div>
      ),
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
          className={`admin-content ${
            isSidebarOpen ? "with-sidebar" : "without-sidebar"
          }`}
          style={{ overflowY: "auto", maxHeight: "100vh" }}
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
              onRequestClose={cancelAddUser}
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
                  <button onClick={confirmAddUser} className="custom-btn">
                    Confirm
                  </button>
                  <button onClick={cancelAddUser} className="custom-btn1">
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
