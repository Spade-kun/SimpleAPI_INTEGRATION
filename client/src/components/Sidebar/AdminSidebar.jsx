// src/components/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./../components-css/AdminSidebar.css";

function AdminSidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show alert only if on dashboard and alert hasn't been dismissed
    if (
      location.pathname === "/admin-dashboard" &&
      !sessionStorage.getItem("alertDismissed")
    ) {
      if (pendingCount > 0) {
        showNotificationAlert(pendingCount);
      }
    }
  }, [pendingCount, location.pathname]);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch("http://localhost:3000/documents");
      if (response.ok) {
        const documents = await response.json();
        const pendingDocs = documents.filter(
          (doc) => doc.status === "Pending"
        ).length;
        setPendingCount(pendingDocs);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
      toast.error("Error fetching notifications");
    }
  };

  const showNotificationAlert = (count) => {
    Swal.fire({
      title: "Pending Document Requests",
      html: `You have <b>${count}</b> pending document ${
        count === 1 ? "request" : "requests"
      } that need${count === 1 ? "s" : ""} your attention.`,
      icon: "info",
      confirmButtonText: "View Notifications",
      showCancelButton: true,
      cancelButtonText: "Later",
      customClass: {
        container: "notification-alert",
        title: "alert-title",
        htmlContainer: "alert-content",
        confirmButton: "alert-confirm-btn",
        cancelButton: "alert-cancel-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin-notifications");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        sessionStorage.setItem("alertDismissed", "true");
      }
    });
  };

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
        sessionStorage.removeItem("alertDismissed"); // Clear alert state

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
    <>
      <ToastContainer />
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
            className="sidebar-item position-relative"
            action
          >
            <Bell className="me-3" />
            Notifications
            {pendingCount > 0 && (
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
                {pendingCount}
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
    </>
  );
}

export default AdminSidebar;
