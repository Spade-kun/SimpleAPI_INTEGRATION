import React, { useState, useEffect } from "react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import { List, Check2Circle, XCircle, FileEarmarkText } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../components-css/RequestDocument.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function RequestsDocument() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocID, setSelectedDocID] = useState(null);
  const [file, setFile] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Define columns for DataTable
  const columns = [
    {
      name: "Document ID",
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
      name: "Requested By",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      className: "status-badge",
      cell: (row) => (
        <span className={`status-badge ${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => handleStatusChange(row.docID, "Approved")}
          >
            <Check2Circle /> Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRejectClick(row.docID)}
          >
            <XCircle /> Reject
          </Button>
        </div>
      ),
    },
  ];

  // Fetch documents from the server
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/documents/");
      setDocuments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleStatusChange = async (docID, newStatus) => {
    try {
      let data = { status: newStatus };
      
      // If rejecting, include the rejection reason
      if (newStatus === "Rejected") {
        data.rejectionReason = rejectionReason;
      }

      const response = await axios.patch(
        `http://localhost:3000/documents/${docID}`,
        data
      );

      if (response.status === 200) {
        toast.success(`Document ${newStatus.toLowerCase()} successfully`);
        fetchDocuments();
        setShowRejectionModal(false);
        setRejectionReason("");
      }
    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()} document:`, error);
      toast.error(`Failed to ${newStatus.toLowerCase()} document`);
    }
  };

  const handleRejectClick = (docID) => {
    setSelectedDocID(docID);
    setShowRejectionModal(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `http://localhost:3000/documents/${selectedDocID}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setShowModal(false);
      fetchDocuments(); // Refresh the documents list
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const openGoogleDocs = () => {
    window.open("https://docs.google.com/document/u/0/", "_blank");
  };

  const handleDownloadLogs = async () => {
    try {
      // Make GET request to download logs endpoint
      const response = await axios.get('http://localhost:3000/documents/download-logs', {
        responseType: 'blob', // Important for handling PDF files
      });

      // Create a blob from the PDF stream
      const file = new Blob([response.data], { type: 'application/pdf' });

      // Create a link element and trigger download
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = 'system_logs.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error downloading logs:', error);
      alert('Error downloading logs');
    }
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
          <div className="button-group">
            <button className="btn btn-primary mx-2" onClick={openGoogleDocs}>
              Edit Document
            </button>
            <button className="btn btn-secondary" onClick={handleDownloadLogs}>
              <FileEarmarkText size={16} className="me-2" />
              Download Logs
            </button>
          </div>
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
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Select File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reason for Rejection</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleStatusChange(selectedDocID, "Rejected")}
            disabled={!rejectionReason.trim()}
          >
            Reject Document
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default RequestsDocument;
