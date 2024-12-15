import React, { useState, useEffect } from "react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import {
  List,
  Check2Circle,
  XCircle,
  FileEarmarkText,
} from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../components-css/RequestDocument.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Swal from 'sweetalert2';

function RequestsDocument() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocID, setSelectedDocID] = useState(null);
  const [file, setFile] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterText, setFilterText] = useState("");

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
            onClick={() => handleApproveClick(row.docID)}
            disabled={row.status !== "Pending"}
          >
            <Check2Circle /> Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleRejectClick(row.docID)}
            disabled={row.status !== "Pending"}
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
      // Prioritize pending documents
      const sortedDocs = response.data.sort((a, b) => (a.status === "Pending" ? -1 : 1));
      setDocuments(sortedDocs);
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

  const handleApproveClick = (docID) => {
    setSelectedDocID(docID);
    setShowModal(true);
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a file to upload.',
      });
      return;
    }

    try {
      // Show loading state
      Swal.fire({
        title: 'Uploading and Approving...',
        html: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formData = new FormData();
      formData.append("file", file);

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
      await handleStatusChange(selectedDocID, "Approved");
      await fetchDocuments();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Document approved successfully',
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error uploading file',
      });
    }
  };

  const handleStatusChange = async (docID, newStatus) => {
    try {
      // Show loading state
      Swal.fire({
        title: `${newStatus === 'Approved' ? 'Approving' : 'Rejecting'}...`,
        html: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let data = { status: newStatus };

      if (newStatus === "Rejected") {
        data.rejectionReason = rejectionReason;
      }

      const response = await axios.patch(
        `http://localhost:3000/documents/${docID}`,
        data
      );

      if (response.status === 200) {
        await fetchDocuments();
        setShowRejectionModal(false);
        setRejectionReason("");

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Document ${newStatus.toLowerCase()} successfully`,
        });
      }
    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()} document:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${newStatus.toLowerCase()} document`,
      });
    }
  };

  const openGoogleDocs = () => {
    window.open("https://docs.google.com/document/u/0/", "_blank");
  };

  const handleDownloadLogs = async () => {
    try {
      Swal.fire({
        title: 'Downloading Logs...',
        html: 'Please wait while we prepare your download.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get(
        "http://localhost:3000/documents/download-logs",
        {
          responseType: "blob",
        }
      );

      const file = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "system_logs.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Logs downloaded successfully',
      });
    } catch (error) {
      console.error("Error downloading logs:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error downloading logs',
      });
    }
  };

  const filteredItems = documents.filter((item) => {
    const searchText = filterText.toLowerCase();
    return (
      item.docID?.toString().toLowerCase().includes(searchText) ||
      item.title?.toLowerCase().includes(searchText) ||
      item.department?.toLowerCase().includes(searchText) ||
      item.email?.toLowerCase().includes(searchText) ||
      item.status?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div
        className={`admin-dashboard-content ${
          !isSidebarOpen ? "sidebar-closed" : ""
        }`}
        style={{ marginLeft: isSidebarOpen ? "250px" : "0" }}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <div className="main-content">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              
          <div className="dashboard-header">
            <p style={{ opacity: 0.7 }}>
              <i>Quality Assurance Office's Document Request System</i>
            </p>
              <h1>Requested Documents</h1>
            <p>Welcome to your document management analytics dashboard</p>
          </div>
              <div className="button-group">
                <button
                  className="btn btn-primary mx-2"
                  onClick={openGoogleDocs}
                >
                  Edit Document
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadLogs}
                >
                  <FileEarmarkText size={16} className="me-2" />
                  Download Logs
                </button>
              </div>
              <div className="search-container" style={{ marginLeft: "15px" }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search requested documents..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            </div>
         
          </div>
          <div className="requests-document-section">
            <DataTable
              title=""
              columns={columns}
              data={filteredItems}
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
      <Modal
        show={showRejectionModal}
        onHide={() => setShowRejectionModal(false)}
      >
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
          <Button
            variant="secondary"
            onClick={() => setShowRejectionModal(false)}
          >
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
    </div>
  );
}

export default RequestsDocument;
