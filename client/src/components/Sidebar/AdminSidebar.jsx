// src/components/Sidebar/AdminSidebar.jsx
import React from "react";
// import "./Sidebar.css";
import { Link } from "react-router-dom";
import { PersonCircle } from "react-bootstrap-icons";
import { Badge } from "react-bootstrap";

function Sidebar() {
  return (
    <div className="sidebar">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-border-width"
        viewBox="0 0 16 16"
      >
        <path d="M0 3.5A.5.5 0 0 1 .5 3h15a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5zm0 5A.5.5 0 0 1 .5 8h15a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H.5a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5" />
      </svg>
      {/* Logo */}
      <div className="d-flex justify-content-center">
        <img
          src="./src/assets/userlogo.svg"
          alt="Logo"
          className="img-fluid"
          style={{ width: "150px" }}
        />
      </div>

      {/* User Info */}
      <div className="text-center mb-4">
        <PersonCircle size={48} /> {/* Bootstrap icon with size */}
        <h5 className="mt-2">Administrator</h5>
        <Badge bg="danger">Admin</Badge>
      </div>

      <Link to="/admin">Dashboard</Link>

      {/* Add more links as needed */}
    </div>
  );
}

export default Sidebar;
