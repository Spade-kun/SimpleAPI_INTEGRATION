// src/components/AdminSidebar.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Badge, ListGroup } from "react-bootstrap";
import {
  Speedometer2,
  FileEarmark,
  GearFill,
  People,
  ClockHistory,
  Bell,
  BoxArrowRight,
} from "react-bootstrap-icons";
import "./../components-css/AdminSidebar.css";

function UserSidebar({ isOpen }) {
  const navigate = useNavigate();

  // Retrieve user information from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const googlePicture = sessionStorage.getItem("googlePicture");

  const handleLogout = () => {
    sessionStorage.removeItem("sessionToken");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("googlePicture");
    navigate("/login");
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
        <Badge bg="warning">{userInfo?.role || "Admin"}</Badge>
      </div>

      {/* Navigation Links */}
      <ListGroup className="sidebar-nav mb-4">
        <ListGroup.Item as={Link} to="/user" className="sidebar-item" action>
          <Speedometer2 className="me-3" /> Dashboard
        </ListGroup.Item>
        <ListGroup.Item
          as={Link}
          to="/documents" // This matches the route in App.jsx
          className="sidebar-item"
          action
        >
          <FileEarmark className="me-3" /> Documents
        </ListGroup.Item>
        <ListGroup.Item
          as={Link}
          to="/request-history"
          className="sidebar-item"
          action
        >
          <ClockHistory className="me-3" /> Request History
        </ListGroup.Item>
        <ListGroup.Item
          as={Link}
          to="/notifications"
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

export default UserSidebar;
