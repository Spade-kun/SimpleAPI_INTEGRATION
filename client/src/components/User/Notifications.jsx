import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../components-css/Notifications.css";
import Footer from "../Footer";

function Notifications() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [stats, setStats] = useState({ approved: 0, rejected: 0 });

  useEffect(() => {
    const token = sessionStorage.getItem("sessionToken");
    const userInfo = sessionStorage.getItem("userInfo");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserEmail(user.email);
      fetchUserNotifications(user.email);
    }
  }, [navigate]);

  const fetchUserNotifications = async (email) => {
    try {
      if (!email) {
        console.error("No email provided");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/documents/user/${email}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Filter for only approved or rejected documents
        const filteredDocs = result.data.filter(
          (doc) => doc.status === "Approved" || doc.status === "Rejected"
        );

        // Calculate stats
        const approved = filteredDocs.filter(
          (doc) => doc.status === "Approved"
        ).length;
        const rejected = filteredDocs.filter(
          (doc) => doc.status === "Rejected"
        ).length;

        setStats({ approved, rejected });
        setDocuments(filteredDocs);
      } else {
        throw new Error(result.message || "Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getNotificationMessage = (status, title) => {
    return status === "Approved"
      ? `Your document "${title}" has been approved!`
      : `Your document "${title}" has been rejected.`;
  };

  const columns = [
    {
      name: "Doc ID",
      selector: (row) => row.docID,
      sortable: true,
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Department",
      selector: (row) => row.department,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className={`status-badge ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Message",
      cell: (row) => getNotificationMessage(row.status, row.title),
      grow: 2,
    },
    {
      name: "File",
      cell: (row) =>
        row.filePath ? (
          <a
            href={`http://localhost:3000/${row.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="download-link"
          >
            Download
          </a>
        ) : (
          "No file"
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Updated At",
      selector: (row) => row.updatedAt,
      sortable: true,
      cell: (row) => formatTimestamp(row.updatedAt),
    },
  ];

  return (
    <div className="user-dashboard-container">
      <ToastContainer />
      <UserSidebar isOpen={isSidebarOpen} />
      <div
        className={`user-dashboard-content1 ${
          isSidebarOpen ? "with-sidebar" : "without-sidebar"
        }`}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <div className="main-content">
        <div className="dashboard-header">
          <p style={{ opacity: 0.7 }}>
            <i>Quality Assurance Office's Document Request System</i>
          </p>
          <h1>Notifications</h1>
          <p>
            <i>View the status updates of your document requests here.</i>
          </p>
        </div>
          
          <div className="notification-stats">
            <div className="stat-card approved">
              <h3>Approved</h3>
              <span className="stat-number">{stats.approved}</span>
            </div>
            <div className="stat-card rejected">
              <h3>Rejected</h3>
              <span className="stat-number">{stats.rejected}</span>
            </div>
          </div>

          <div className="notifications-table-container">
            <DataTable
              columns={columns}
              data={documents}
              pagination
              highlightOnHover
              striped
              responsive
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 350px)"
              progressPending={loading}
              progressComponent={<div>Loading notifications...</div>}
              noDataComponent={<div>No notifications found</div>}
              defaultSortFieldId={7} // Sort by Updated At by default
              defaultSortAsc={false} // Show newest first
            />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Notifications;
