import React, { useEffect, useState } from "react";
import axios from "axios";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get("https://projectcrm-dgrs.onrender.com/api/campaigns");
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCampaigns();
  }, []);

  const formatDate = (dateString) => {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return new Date(dateString).toLocaleString('en-IN', options);
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="/dashboard">
          CustomerReach
        </a>
      </nav>
      <div className="container mt-5">
        <h2>Campaigns</h2>
        {campaigns.length > 0 ? (
          <ul className="list-group">
            {campaigns.map((campaign, index) => (
              <li key={campaign._id} className="list-group-item">
                <h5>Campaign {index + 1}</h5>
                <p>Audience Size: {campaign.audienceSize}</p>
                <p>Sent: {campaign.sent}</p>
                <p>Failed: {campaign.failed}</p>
                <p>Status: {campaign.status}</p>
                <p>Created At: {formatDate(campaign.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No campaigns found.</p>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
