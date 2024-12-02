import React, { useState, useEffect } from "react";
import UserSidebar from "./Sidebar/UserSidebar";
import { List } from "react-bootstrap-icons";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import "./components-css/UserDashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [documentStats, setDocumentStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [monthlyRequests, setMonthlyRequests] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:3000/documents/");
      if (response.ok) {
        const documents = await response.json();

        // Calculate document statistics
        const stats = {
          pending: documents.filter((doc) => doc.status === "Pending").length,
          approved: documents.filter((doc) => doc.status === "Approved").length,
          rejected: documents.filter((doc) => doc.status === "Rejected").length,
          total: documents.length,
        };
        setDocumentStats(stats);

        // Calculate monthly requests
        const monthlyData = new Array(12).fill(0);
        documents.forEach((doc) => {
          const month = new Date(doc.createdAt).getMonth();
          monthlyData[month]++;
        });
        setMonthlyRequests(monthlyData);

        // Calculate department statistics
        const deptStats = {};
        documents.forEach((doc) => {
          deptStats[doc.department] = (deptStats[doc.department] || 0) + 1;
        });
        setDepartmentStats(deptStats);

        // Get recent activity
        const sortedDocs = [...documents]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 3)
          .map((doc) => ({
            status: doc.status,
            title: doc.title,
            time: new Date(doc.updatedAt).toLocaleString(),
          }));
        setRecentActivity(sortedDocs);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Chart Data
  const monthlyRequestsData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Document Requests",
        data: monthlyRequests,
        fill: true,
        borderColor: "#4a90e2",
        backgroundColor: "rgba(74, 144, 226, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const statusDistributionData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        data: [
          documentStats.pending,
          documentStats.approved,
          documentStats.rejected,
        ],
        backgroundColor: ["#ffd700", "#4caf50", "#f44336"],
        borderWidth: 0,
      },
    ],
  };

  const departmentData = {
    labels: Object.keys(departmentStats),
    datasets: [
      {
        label: "Requests by Department",
        data: Object.values(departmentStats),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
      },
    ],
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="user-dashboard-container">
      <UserSidebar isOpen={isSidebarOpen} />
      <div
        className={`user-dashboard-content ${
          isSidebarOpen ? "with-sidebar" : "without-sidebar"
        }`}
      >
        <button className="hamburger-icon" onClick={toggleSidebar}>
          <List size={24} />
        </button>

        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome to your document management analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Requests</h3>
            <p className="stat-number">{documentStats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number pending">{documentStats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-number approved">{documentStats.approved}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <p className="stat-number rejected">{documentStats.rejected}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Monthly Trends */}
          <div className="chart-container">
            <h2>Monthly Request Trends</h2>
            <Line
              data={monthlyRequestsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Document Requests Over Time",
                  },
                },
              }}
            />
          </div>

          {/* Status Distribution */}
          <div className="chart-container">
            <h2>Request Status Distribution</h2>
            <Doughnut
              data={statusDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>

          {/* Department Distribution */}
          <div className="chart-container wide">
            <h2>Requests by Department</h2>
            <Bar
              data={departmentData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <span
                  className={`activity-dot ${activity.status.toLowerCase()}`}
                ></span>
                <p>{activity.title}</p>
                <small>{getTimeAgo(activity.time)}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
