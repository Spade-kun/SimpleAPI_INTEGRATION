import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "./Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import "./components-css/UserDashboard.css";
import StepsPanel from "./StepsPanel/StepsPanel";

function UserDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [formVisible, setFormVisible] = useState(false); // State for controlling form visibility
  const [formData, setFormData] = useState({
    email: "",
    title: "",
    content: "",
    department: "",
  });

  useEffect(() => {
    // Check if token is expired and auto logout
    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    } else {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        sessionStorage.removeItem("sessionToken");
        navigate("/login");
      }
    }

    // Fetch documents from the backend
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("sessionToken");
    if (!token) {
      console.error("No session token found");
      return;
    }

    const response = await fetch("http://localhost:3000/documents/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send the token for authorization
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      setFormVisible(false); // Hide the form on successful submission
      fetchDocuments(); // Refresh the document list
    } else {
      console.error("Failed to request document");
    }
  };

  // Columns configuration for DataTable
  const columns = [
    { name: "Doc ID", selector: (row) => row.docID, sortable: true },
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Content", selector: (row) => row.content, sortable: true },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
  ];

  return (
    <div className="user-dashboard-container">
      <UserSidebar isOpen={isSidebarOpen} />
      <div
        className="user-dashboard-content"
        style={{ marginLeft: isSidebarOpen ? "250px" : "0" }}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={10} />
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
          <button
            onClick={() =>
              window.open(
                "https://docs.google.com/forms/d/e/1FAIpQLScFh4-kAz5OM22ogK941rFNWxpfMJQ_E-UxAkPGYltyqYi2OQ/viewform?usp=sf_link",
                "_blank"
              )
            }
          >
            Request Document
          </button>

          {/* Conditional rendering of the form */}
          {formVisible && (
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
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit">Confirm</button>
              <button type="button" onClick={() => setFormVisible(false)}>
                Cancel
              </button>
            </form>
          )}

          {/* Documents Data Table */}
          <h2>Documents</h2>
          <DataTable
            columns={columns}
            data={documents}
            pagination
            highlightOnHover
            striped
          />
          <StepsPanel />
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
