import React, { useState, useEffect } from "react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import { List } from "react-bootstrap-icons";
import { Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../components-css/AdminAccount.css";

function Account() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = sessionStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userInfo);
    setUserDetails(user);
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className="admin-dashboard-content">
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <Container className="mt-4">
          <h1 className="mb-4">Account Details</h1>
          {userDetails && (
            <Card className="account-card">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={3} className="field-label">Name:</Col>
                  <Col md={9} className="field-value">{userDetails.name}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={3} className="field-label">Email:</Col>
                  <Col md={9} className="field-value">{userDetails.email}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={3} className="field-label">Department:</Col>
                  <Col md={9} className="field-value">{userDetails.department || "Not specified"}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={3} className="field-label">Role:</Col>
                  <Col md={9} className="field-value">{userDetails.role}</Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </div>
  );
}

export default Account;
