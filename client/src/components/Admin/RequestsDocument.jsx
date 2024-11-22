import React, { useState, useEffect } from "react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import { List, Check2Circle, XCircle } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../components-css/RequestDocument.css";


function RequestsDocument() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define columns for DataTable
  const columns = [
    {
      name: "Document ID",
      selector: row => row.docID,
      sortable: true,
    },
    {
      name: "Title",
      selector: row => row.title,
      sortable: true,
    },
    {
      name: "Department",
      selector: row => row.department,
      sortable: true,
    },
    {
      name: "Requested By",
      selector: row => row.email,
      sortable: true,
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons">
          <button
            className="btn btn-success btn-sm mx-1"
            onClick={() => handleApprove(row.docID)}
            disabled={row.status !== 'Pending'}
          >
            <Check2Circle size={16} /> Approve
          </button>
          <button
            className="btn btn-danger btn-sm mx-1"
            onClick={() => handleReject(row.docID)}
            disabled={row.status !== 'Pending'}
          >
            <XCircle size={16} /> Reject
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];

  // Fetch documents from the server
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/documents/');
      setDocuments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleApprove = async (docID) => {
    try {
      await axios.put(`http://localhost:3000/documents/${docID}/approve`);
      // Refresh the documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleReject = async (docID) => {
    try {
      await axios.put(`http://localhost:3000/documents/${docID}/reject`);
      // Refresh the documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
    }
  };

  const openGoogleDocs = () => {
    window.open('https://docs.google.com/document/u/0/', '_blank');
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div
        className="admin-dashboard-content"
        style={{ marginLeft: isSidebarOpen ? "" : "" }}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <div className="main-content">
          <h1>Requests Document</h1>
          <button className="btn btn-primary" onClick={openGoogleDocs}>
            Edit Document
          </button>
          <div className="requests-document-section">
            <DataTable
              title="Document Requests"
              columns={columns}
              data={documents}
              pagination
              progressPending={loading}
              responsive
              striped
              highlightOnHover
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestsDocument;
