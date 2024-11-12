import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Badge, ListGroup } from "react-bootstrap";
import {
  PersonCircle,
  Speedometer2,
  FileEarmark,
  GearFill,
  People,
  BoxArrowRight,
} from "react-bootstrap-icons";
import "./../components-css/AdminSidebar.css";

function AdminSidebar({ isOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("sessionToken");
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
        <PersonCircle size={48} />
        <h5 className="mt-2">Administrator</h5>
        <Badge bg="danger">Admin</Badge>
      </div>

      {/* Navigation Links */}
      <ListGroup className="sidebar-nav mb-4">
        <ListGroup.Item as={Link} to="/admin" className="sidebar-item" action>
          <Speedometer2 className="me-3" /> Dashboard
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
