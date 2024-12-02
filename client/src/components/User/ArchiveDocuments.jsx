import React, { useState, useEffect } from "react";
import UserSidebar from "../Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

function ArchiveDocuments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [archivedDocuments, setArchivedDocuments] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchArchivedDocuments();
  }, []);

  const fetchArchivedDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3000/documents/archived");
      if (response.ok) {
        const data = await response.json();
        setArchivedDocuments(data);
      } else {
        console.error("Failed to fetch archived documents");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleRecover = async (docID) => {
    Swal.fire({
      title: "Recover Document",
      text: "Are you sure you want to recover this document?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, recover it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = sessionStorage.getItem("sessionToken");
        try {
          const response = await fetch(
            `http://localhost:3000/documents/unarchive/${docID}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            // Remove the recovered document from the archived list
            setArchivedDocuments(
              archivedDocuments.filter((doc) => doc.docID !== docID)
            );

            Swal.fire(
              "Recovered!",
              "Your document has been recovered successfully.",
              "success"
            );
          } else {
            const error = await response.json();
            Swal.fire(
              "Error!",
              error.message || "Failed to recover document",
              "error"
            );
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Error!", "Failed to recover document", "error");
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
            className="icon-button recover-btn"
            onClick={() => handleRecover(row.docID)}
            title="Recover"
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="user-dashboard-container">
      <UserSidebar isOpen={isSidebarOpen} />
      <div
        className="user-dashboard-content"
        style={{ marginLeft: isSidebarOpen ? "250px" : "0" }}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>
        <div className="main-content">
          <h1>Archive Documents</h1>
          <p>View and manage your archived documents here.</p>

          <div className="documents-table-container">
            <DataTable
              columns={columns}
              data={archivedDocuments}
              pagination
              highlightOnHover
              striped
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 350px)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArchiveDocuments;
