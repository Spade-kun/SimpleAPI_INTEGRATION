import React, { useState } from "react";
import UserSidebar from "../Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import StepsPanel from "../StepsPanel/StepsPanel";

function RequestHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
          <h1>Request History</h1>
          <p>View and manage your request history here.</p>

          {/* Add your request history content here */}
          <div className="request-history-section">
            {/* Your request history table or list */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestHistory;
