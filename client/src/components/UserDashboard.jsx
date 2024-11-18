import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import Modal from "react-modal"; // Import Modal
import "./components-css/UserDashboard.css";
import StepsPanel from "./StepsPanel/StepsPanel";
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

function UserDashboard() {
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

  useEffect(() => {
    const token = sessionStorage.getItem("sessionToken");
    const userInfo = sessionStorage.getItem("userInfo");
    const welcomeShown = sessionStorage.getItem("welcomeShown");

    if (!token) {
      navigate("/login");
    } else {
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setUserName(user.name);
        if (welcomeShown !== "true") {
          Swal.fire({
            title: `Welcome ${user.name}! 👋`,
            text: "We're glad to have you back",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: "#fff",
            customClass: {
              popup: "animated fadeInDown",
              title: "swal2-title",
              content: "swal2-content",
              timerProgressBar: "swal2-timer-progress-bar",
            },
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
          sessionStorage.setItem("welcomeShown", "true");
        }
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        sessionStorage.removeItem("sessionToken");
        navigate("/login");
      }
    }

    fetchDocuments();
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3000/documents/");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error("Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error:", error);
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
    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Please login first",
      });
      navigate("/login");
      return;
    }

    // Validate form data
    if (
      !formData.email ||
      !formData.title ||
      !formData.content ||
      !formData.department
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all fields",
      });
      return;
    }

    try {
      // Show loading state
      Swal.fire({
        title: "Submitting Request",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch("http://localhost:3000/documents/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Close loading state and show success message
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Document request submitted successfully!",
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          setIsModalOpen(false);
          setFormData({
            email: "",
            title: "",
            content: "",
            department: "",
            status: "Pending",
          });
          fetchDocuments();
        });
      } else {
        throw new Error(data.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message || "Failed to submit request. Please try again.",
      });
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
    const token = sessionStorage.getItem("sessionToken");

    try {
      const response = await fetch(
        `http://localhost:3000/documents/${editingDocument.docID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingDocument),
        }
      );

      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingDocument(null);
        fetchDocuments();
        Swal.fire(
          "Updated!",
          "Document has been updated successfully.",
          "success"
        );
      } else {
        const error = await response.json();
        Swal.fire(
          "Error!",
          error.message || "Failed to update document",
          "error"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error!", "Failed to update document", "error");
    }
  };

  const handleDelete = async (docID) => {
    Swal.fire({
      title: "Cancel Document",
      text: "Are you sure you want to cancel this document request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = sessionStorage.getItem("sessionToken");
        try {
          const response = await fetch(
            `http://localhost:3000/documents/${docID}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            Swal.fire(
              "Cancelled!",
              "Your document request has been cancelled.",
              "success"
            );
            fetchDocuments();
          } else {
            const error = await response.json();
            Swal.fire(
              "Error!",
              error.message || "Failed to cancel document",
              "error"
            );
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Error!", "Failed to cancel document", "error");
        }
      }
    });
  };

  const handleArchive = async (docID) => {
    Swal.fire({
      title: "Archive Document",
      text: "Are you sure you want to archive this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = sessionStorage.getItem("sessionToken");
        try {
          const response = await fetch(
            `http://localhost:3000/documents/archive/${docID}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            // Remove the archived document from the current documents list
            setDocuments(documents.filter((doc) => doc.docID !== docID));

            Swal.fire(
              "Archived!",
              "Your document has been archived.",
              "success"
            );
          } else {
            const error = await response.json();
            Swal.fire(
              "Error!",
              error.message || "Failed to archive document",
              "error"
            );
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Error!", "Failed to archive document", "error");
        }
      }
    });
  };

  const columns = [
    { name: "Doc ID", selector: (row) => row.docID, sortable: true },
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Content", selector: (row) => row.content, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Status", selector: (row) => row.status, sortable: true },
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
          <List size={20} />
        </button>
        <div>
          <p style={{ opacity: 0.7 }}>
            <i>Quality Assurance Office's Document Request System</i>
          </p>
          <br />
          <h1>User Dashboard</h1>
          <p>
            <i>Welcome! Here you can view and manage your document requests.</i>
          </p>
          <button onClick={handleOpenModal} className="custom-btn">
            Request Document
          </button>

          {/* Modal for document request */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            style={customStyles}
            contentLabel="Request Document Modal"
          >
            <div className="modal-header">
              <h2>Request Document</h2>
              <button onClick={handleCloseModal} className="close-button">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Content:</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div>
                <label>Department:</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="department-select"
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
                <button type="submit">Submit</button>
                <button type="button" onClick={handleCloseModal}>
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

export default UserDashboard;
