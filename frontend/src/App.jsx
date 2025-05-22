import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Dashboard from "./dashboard";

// COMPONENTs
import Navbar from "./components/Navbar";


import Graph from "./components/Graph";




function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<SignIn setToken={setToken} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/graph" element={<Graph token={token} />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} setToken={setToken} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
