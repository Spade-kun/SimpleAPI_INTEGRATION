import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../components-css/RequestHistory.css";

function RequestHistory() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");

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
      fetchUserDocuments(user.email);
    }
  }, [navigate]);

  const fetchUserDocuments = async (email) => {
    try {
      if (!email) {
        console.error("No email provided");
        return;
      }

      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/documents/user/${email}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(`Fetched ${result.count} documents for ${email}`);
        setDocuments(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching user documents:", error);
      setError("Failed to load documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Content",
      selector: (row) => row.content,
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
      name: "Requested At",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="user-dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="light"
      />
      <UserSidebar isOpen={isSidebarOpen} />
      <div
        className={`user-dashboard-content ${
          isSidebarOpen ? "with-sidebar" : "without-sidebar"
        }`}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <div className="main-content">
          <p style={{ opacity: 0.7 }}>
            <i>Quality Assurance Office's Document Request System</i>
          </p>
          <br />
          <h1>Request History</h1>
          <p>
            <i>View your document request history here.</i>
          </p>
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="documents-table-container">
              <DataTable
                columns={columns}
                data={documents}
                pagination
                highlightOnHover
                striped
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 350px)"
                progressPending={loading}
                progressComponent={<div>Loading documents...</div>}
                noDataComponent={<div>No documents found</div>}
                responsive
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestHistory;
