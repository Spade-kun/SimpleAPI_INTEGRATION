import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, AppBar, Toolbar, Button,
  Paper, Grid, IconButton
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { List } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "./Sidebar/AdminSidebar";
import { Line, Doughnut } from "react-chartjs-2";
import "./components-css/AdminDashboard.css";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [archivedDocs, setArchivedDocs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem('sessionToken');
  const user = JSON.parse(sessionStorage.getItem('userInfo'));

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseURL = "http://localhost:3000/api";

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const [usersRes, docsRes, archivedRes] = await Promise.all([
        axios.get(`${baseURL}/users`, config),
        axios.get(`${baseURL}/documents`, config),
        axios.get(`${baseURL}/documents/archived`, config)
      ]);

      if (usersRes.data && docsRes.data && archivedRes.data) {
        setUsers(usersRes.data);
        setDocuments(docsRes.data);
        setArchivedDocs(archivedRes.data);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data");
      setUsers([]);
      setDocuments([]);
      setArchivedDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const documentStatusData = {
    labels: ["Active", "Archived"],
    datasets: [
      {
        data: [documents.length || 0, archivedDocs.length || 0],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const monthlyDocumentData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Document Requests",
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar isOpen={isSidebarOpen} />
      <Box sx={{ flexGrow: 1, ml: isSidebarOpen ? '250px' : 0, transition: 'margin 0.3s' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" onClick={toggleSidebar}>
              <List size={24} />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
              Admin Dashboard
            </Typography>
            <Typography sx={{ mr: 2 }}>
              {user?.name} (Admin)
            </Typography>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{users.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Active Documents</Typography>
                <Typography variant="h4">{documents.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Archived Documents</Typography>
                <Typography variant="h4">{archivedDocs.length}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Document Status Distribution</Typography>
                <Doughnut data={documentStatusData} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Monthly Document Requests</Typography>
                <Line data={monthlyDocumentData} />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Recent Documents</Typography>
                  <IconButton onClick={fetchData}>
                    <Refresh />
                  </IconButton>
                </Box>
                {documents.slice(0, 5).map((doc, index) => (
                  <Box key={index} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle1">{doc.title || "Untitled"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {doc.status || "Pending"} | Created: {new Date(doc.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;