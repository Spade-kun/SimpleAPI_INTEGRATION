// src/components/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Badge, ListGroup } from "react-bootstrap";
import {
  Speedometer2,
  FileEarmark,
  GearFill,
  People,
  ClockHistory,
  Bell,
  Archive,
  BoxArrowRight,
} from "react-bootstrap-icons";
import Swal from "sweetalert2";
import "./../components-css/AdminSidebar.css";

function UserSidebar({ isOpen }) {
  const navigate = useNavigate();

  // Retrieve user information from sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const googlePicture = sessionStorage.getItem("googlePicture");

  const [notificationCount, setNotificationCount] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const userInfo = sessionStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserEmail(user.email);
      fetchNotificationCount(user.email);

      // Optional: Set up polling to refresh count
      const interval = setInterval(
        () => fetchNotificationCount(user.email),
        30000
      );
      return () => clearInterval(interval);
    }
  }, []);

  const fetchNotificationCount = async (email) => {
    try {
      const response = await fetch(
        `http://localhost:3000/documents/user/${email}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const result = await response.json();
      if (result.success) {
        // Count documents that are either Approved or Rejected
        const count = result.data.filter(
          (doc) => doc.status === "Approved" || doc.status === "Rejected"
        ).length;
        setNotificationCount(count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

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
        // Clear all session data first
        sessionStorage.clear();

        // Show success message
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
          // Force page reload and redirect
          window.location.href = "/login";
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
          to="/archive-documents"
          className="sidebar-item"
          action
        >
          <Archive className="me-3" /> Archive Documents
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
          className="sidebar-item position-relative"
          action
        >
          <Bell className="me-3" />
          Notifications
          {notificationCount > 0 && (
            <Badge
              bg="danger"
              className="notification-badge"
              style={{
                position: "absolute",
                right: "10px",
                borderRadius: "50%",
                padding: "0.25em 0.6em",
              }}
            >
              {notificationCount}
            </Badge>
          )}
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
