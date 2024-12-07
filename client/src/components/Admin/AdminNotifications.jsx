import React, { useState, useEffect } from "react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminNotifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3000/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      // Filter for pending documents only
      const pendingDocs = data.filter((doc) => doc.status === "Pending");
      setDocuments(pendingDocs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
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
      name: "Requester",
      selector: (row) => row.email,
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
      cell: (row) => formatTimestamp(row.createdAt),
    },
    {
      name: "File",
      cell: (row) =>
        row.filePath ? (
          <a
            href={`http://localhost:3000/${row.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
        ) : (
          <span style={{ color: "#dc3545" }}>No file</span>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="admin-dashboard-container">
      <ToastContainer />
      <AdminSidebar isOpen={isSidebarOpen} />
      <div
        className="admin-dashboard-content"
        style={{ marginLeft: isSidebarOpen ? "250px" : "0" }}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <div className="main-content">
          <p style={{ opacity: 0.7 }}>
            <i>Quality Assurance Office's Document Request System</i>
          </p>
          <br />
          <h1>Document Requests</h1>
          <p>
            <i>View and manage pending document requests here.</i>
          </p>

          <div className="documents-table-container">
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
              progressComponent={<div>Loading documents...</div>}
              noDataComponent={<div>No pending requests found</div>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;
