// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/LoginPage';
import Dashboard from './components/DashboredPage';
import Audience from './components/AudiencePage';
import Campaigns from './components/campaigns';
import Footer from './components/Footer';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-audience" element={<Audience />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/" element={<Login />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
