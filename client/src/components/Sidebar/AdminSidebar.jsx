// src/components/AdminSidebar.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Badge, ListGroup } from "react-bootstrap";
import {
  Speedometer2,
  FileEarmark,
  GearFill,
  People,
  BoxArrowRight,
  PersonCircle,
  Bell,
  PersonGear,
} from "react-bootstrap-icons";
import Swal from "sweetalert2";
import "./../components-css/AdminSidebar.css";

function AdminSidebar({ isOpen }) {
  const navigate = useNavigate();

  // Retrieve user information from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const googlePicture = sessionStorage.getItem("googlePicture");

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
      background: "#fff",
      customClass: {
        popup: "animated fadeInDown",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();

        // Double-check specific items are removed
        localStorage.removeItem("welcomeShown");
        sessionStorage.removeItem("welcomeShown");
        sessionStorage.removeItem("sessionToken");
        sessionStorage.removeItem("userInfo");

        // Verify items are cleared
        console.log(
          "Welcome shown after clear:",
          localStorage.getItem("welcomeShown")
        );

        Swal.fire({
          icon: "success",
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          timer: 1500,
          showConfirmButton: false,
          background: "#fff",
          customClass: {
            popup: "animated fadeInDown",
          },
        }).then(() => {
          // Force page reload before navigation
          window.location.href = "/login";
          // Or use navigate if you prefer
          // navigate("/login");
        });
      }
    });
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo */}
      <div className="d-flex justify-content-center mb-4">
        <img
          src="./src/assets/userlogo.svg"
          alt="Logo"
          className="img-fluid"
          style={{ width: "150px" }}
        />
      </div>

      {/* User Info */}
      <div className="text-center mb-4">
        {googlePicture ? (
          <img
            src={googlePicture}
            alt="Profile"
            className="rounded-circle"
            style={{ width: "64px", height: "64px" }}
          />
        ) : (
          <PersonCircle size={48} />
        )}
        <h5 className="mt-2">{userInfo?.name || "Administrator"}</h5>
        <Badge bg="danger">{userInfo?.role || "Admin"}</Badge>
      </div>

      {/* Navigation Links */}
      <ListGroup className="sidebar-nav mb-4">
        <ListGroup.Item as={Link} to="/admin" className="sidebar-item" action>
          <Speedometer2 className="me-3" /> Dashboard
        </ListGroup.Item>
        <ListGroup.Item
          as={Link}
          to="/requests-document"
          className="sidebar-item"
          action
        >
          <FileEarmark className="me-3" /> Document Request
        </ListGroup.Item>
        <ListGroup.Item as={Link} to="/account" className="sidebar-item" action>
          <PersonGear className="me-3" /> Account
        </ListGroup.Item>
        <ListGroup.Item
          as={Link}
          to="/displayUsers"
          className="sidebar-item"
          action
        >
          <People className="me-3" /> Users
        </ListGroup.Item>
        <ListGroup.Item
          as={Link}
          to="/admin-notifications"
          className="sidebar-item"
          action
        >
          <Bell className="me-3" /> Notifications
        </ListGroup.Item>
      </ListGroup>

      {/* Logout Button */}
      <div className="mt-auto">
        <Button variant="danger" className="w-100" onClick={handleLogout}>
          <BoxArrowRight className="me-2" /> Log Out
        </Button>
      </div>
    </div>
  );
}

export default AdminSidebar;
