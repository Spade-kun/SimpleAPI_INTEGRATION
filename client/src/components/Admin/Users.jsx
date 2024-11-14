import React, { useState } from "react";
import AdminSidebar from "../Sidebar/AdminSidebar";
import { List } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";

function Users() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
          <h1>Users</h1>
          <p>View and manage your users here.</p>

          {/* Add your users content here */}
          <div className="users-section">{/* Your users table or list */}</div>
        </div>
      </div>
    </div>
  );
}

export default Users;
