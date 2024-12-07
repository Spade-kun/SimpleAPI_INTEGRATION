import React, { useState, useEffect } from "react";
import AdminSidebar from "./Sidebar/AdminSidebar";
import { List } from "react-bootstrap-icons";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import "./components-css/AdminDashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Swal from "sweetalert2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [archivedDocs, setArchivedDocs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add welcome alert
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

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseURL = "http://localhost:3000"; // adjust if your port is different

      const [usersRes, docsRes, archivedRes] = await Promise.all([
        axios.get(`${baseURL}/users/`),
        axios.get(`${baseURL}/documents/`),
        axios.get(`${baseURL}/documents/archived`),
      ]);

      // Ensure we're setting arrays, even if empty
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
      setArchivedDocs(Array.isArray(archivedRes.data) ? archivedRes.data : []);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data");
      // Set empty arrays on error
      setUsers([]);
      setDocuments([]);
      setArchivedDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Document status distribution data
  const documentStatusData = {
    labels: ["Active", "Archived"],
    datasets: [
      {
        data: [documents.length || 0, archivedDocs.length || 0],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Monthly document requests data
  const monthlyDocumentData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Document Requests",
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div
        className="admin-dashboard-content"
        style={{ marginLeft: isSidebarOpen ? "250px" : "0" }}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <div className="main-content">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active Documents</h3>
              <p>{documents.length}</p>
            </div>
            <div className="stat-card">
              <h3>Archived Documents</h3>
              <p>{archivedDocs.length}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Document Status Distribution</h3>
              <Doughnut data={documentStatusData} />
            </div>
            <div className="chart-container">
              <h3>Monthly Document Requests</h3>
              <Line data={monthlyDocumentData} />
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="recent-activity">
            <h3>Recent Documents</h3>
            <div className="activity-list">
              {Array.isArray(documents) && documents.length > 0 ? (
                documents.slice(0, 5).map((doc, index) => (
                  <div key={index} className="activity-item">
                    <span className="title">{doc.title || "Untitled"}</span>
                    <span
                      className={`status ${
                        doc.status?.toLowerCase() || "pending"
                      }`}
                    >
                      {doc.status || "Pending"}
                    </span>
                    <span className="time">
                      {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <span className="title">No documents available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
