// src/components/DashboardPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://projectcrm-dgrs.onrender.com/api/current_user",
          { withCredentials: true }
        );
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const response = await axios.get("https://projectcrm-dgrs.onrender.com/api/campaigns");
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCampaigns();
  }, []);

  const handleLogout = () => {
    window.location.href = "https://projectcrm-dgrs.onrender.com/api/logout";
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="/dashboard">
          Dashboard
        </a>
        <div className="d-flex">
          <a className="nav-link text-white" href="/create-audience">
            Create Audience
          </a>
          <a className="nav-link text-white" href="/campaigns">
            Campaigns
          </a>
          <button className="btn btn-outline-light" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>
      <div className="container mt-5">
        {user ? <h3>Welcome, {user.displayName}</h3> : <h3>Welcome, User</h3>}
        <h4>Recent Campaigns</h4>
        {loading ? (
          <p>Loading campaigns...</p>
        ) : (
          <ul className="list-group">
            {campaigns.length === 0 ? (
              <p>No campaigns found.</p>
            ) : (
              campaigns.map((campaign, index) => (
                <li key={index} className="list-group-item">
                  <h5>Campaign {index + 1}</h5>
                  <p>Audience Size: {campaign.audienceSize}</p>
                  <p>Sent: {campaign.sent}</p>
                  <p>Failed: {campaign.failed}</p>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
