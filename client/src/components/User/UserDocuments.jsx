import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import Modal from "react-modal"; // Import Modal
import "../components-css/UserDocuments.css";
import StepsPanel from "../StepsPanel/StepsPanel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faBan,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

Modal.setAppElement("#root"); // For accessibility

// Add these custom styles for the modal
const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
  },
};

function UserDocuments() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    title: "",
    content: "",
    department: "",
    status: "Pending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [userName, setUserName] = useState("");
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
      setUserName(user.name);
      setUserEmail(user.email);

      setFormData((prevState) => ({
        ...prevState,
        email: user.email,
      }));

      fetchUserDocuments(user.email);
    }
  }, [navigate]);

  const fetchUserDocuments = async (email) => {
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
        console.log(`Fetched ${result.count} documents for ${email}`);
        setDocuments(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching user documents:", error);
      toast.error("Failed to load documents: " + error.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sessionToken");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Function to show the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Function to hide the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/documents/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchUserDocuments(userEmail);
        toast.success("Document submitted successfully!");
      } else {
        toast.error("Failed to submit document");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting document");
    }
  };

  const handleEdit = (docID, document) => {
    Swal.fire({
      title: "Edit Document",
      text: "Are you sure you want to edit this document?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, edit it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setEditingDocument(document);
        setIsEditModalOpen(true);
      }
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/documents/${editingDocument.docID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingDocument),
        }
      );

      if (response.ok) {
        setIsEditModalOpen(false);
        fetchUserDocuments(userEmail);
        toast.success("Document updated successfully!");
      } else {
        toast.error("Failed to update document");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error updating document");
    }
  };

  const handleDelete = async (docID) => {
    try {
      const result = await Swal.fire({
        title: "Cancel Document",
        text: "Are you sure you want to cancel this document request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it",
      });

      if (result.isConfirmed) {
        const response = await fetch(
          `http://localhost:3000/documents/${docID}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchUserDocuments(userEmail);
          toast.success("Document deleted successfully!");
        } else {
          toast.error("Failed to delete document");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error deleting document");
    }
  };

  const handleArchive = async (docID) => {
    try {
      const response = await fetch(
        `http://localhost:3000/documents/archive/${docID}`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        fetchUserDocuments(userEmail);
        toast.success("Document archived successfully!");
      } else {
        toast.error("Failed to archive document");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error archiving document");
    }
  };

  const columns = [
    { name: "Doc ID", selector: (row) => row.docID, sortable: true },
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Content", selector: (row) => row.content, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
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
          "No file"
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="action-buttons">
          <button
            className="icon-button edit-btn"
            onClick={() => handleEdit(row.docID, row)}
            title="Edit"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
          <button
            className="icon-button delete-btn"
            onClick={() => handleDelete(row.docID)}
            title="Cancel"
          >
            <FontAwesomeIcon icon={faBan} />
          </button>
          {!row.isArchived && (
            <button
              className="icon-button archive-btn"
              onClick={() => handleArchive(row.docID)}
              title="Archive"
            >
              <FontAwesomeIcon icon={faBoxArchive} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Add departments array
  const departments = [
    "College of Technologies",
    "College of Education",
    "College of Engineering",
    "College of Architecture",
    "College of Business",
    // Add more departments as needed
  ];

  // Add function to handle document cancellation
  const handleCancel = async (docID) => {
    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/documents/cancel/${docID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Document cancelled successfully!");
        fetchDocuments(); // Refresh the list
      } else {
        throw new Error(data.message || "Failed to cancel document");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Failed to cancel document");
    }
  };

  // Add this new function to handle Google Form opening
  const handleGoogleFormOpen = () => {
    // Replace this URL with your actual Google Form URL
    const googleFormUrl = "https://forms.gle/rZqjYHrDLgHqyvBV6";
    window.open(googleFormUrl, "_blank", "noopener,noreferrer");
  };

  // Add new function to handle sync
  const handleSyncFromSheets = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/documents/sync-sheets",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Successfully synced data from Google Sheets!");
        fetchUserDocuments(userEmail); // Refresh the documents list
      } else {
        toast.error("Failed to sync: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Error syncing from sheets: " + error.message);
    }
  };

  return (
    <div className="user-dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
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
        <div>
          <p style={{ opacity: 0.7 }}>
            <i>Quality Assurance Office's Document Request System</i>
          </p>
          <br />
          <h1>User Documents</h1>
          <p>
            <i>Welcome! Here you can view and manage your document requests.</i>
          </p>
          <div
            className="button-container"
            style={{ display: "flex", gap: "10px" }}
          >
            <button onClick={handleOpenModal} className="custom-btn">
              Request Document
            </button>
            <button onClick={handleGoogleFormOpen} className="custom-btn">
              Open Google Form
            </button>
            <button onClick={handleSyncFromSheets} className="custom-btn">
              Sync from Sheets
            </button>
          </div>

          {/* Modal for document request */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            style={customStyles}
            contentLabel="Request Document Modal"
          >
            <div className="modal-header">
              <h2>Request Document</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="close-button"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="form-control readonly-input"
                />
              </div>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Content:</label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Department:</label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  required
                  className="form-control"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="custom-btn">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="custom-btn1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isEditModalOpen}
            onRequestClose={() => setIsEditModalOpen(false)}
            style={customStyles}
            contentLabel="Edit Document Modal"
          >
            <div className="modal-header">
              <h2>Edit Document</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="close-button"
              >
                &times;
              </button>
            </div>
            {editingDocument && (
              <form onSubmit={handleEditSubmit}>
                <div>
                  <label>Title:</label>
                  <input
                    type="text"
                    value={editingDocument.title}
                    onChange={(e) =>
                      setEditingDocument({
                        ...editingDocument,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Content:</label>
                  <textarea
                    value={editingDocument.content}
                    onChange={(e) =>
                      setEditingDocument({
                        ...editingDocument,
                        content: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Department:</label>
                  <select
                    value={editingDocument.department}
                    onChange={(e) =>
                      setEditingDocument({
                        ...editingDocument,
                        department: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="button-group">
                  <button type="submit">Save Changes</button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </Modal>

          <h2>Documents</h2>
          <div className="documents-table-container">
            <DataTable
              columns={columns}
              data={documents}
              pagination
              highlightOnHover
              striped
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 350px)"
            />
          </div>
          <StepsPanel />
        </div>
      </div>
    </div>
  );
}

export default UserDocuments;
