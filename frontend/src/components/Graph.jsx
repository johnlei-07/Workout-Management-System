import React, { useState, useEffect } from "react";
import { Container, Dropdown, Button } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import axios from "axios";
import "./graph.css";    
import { useNavigate } from "react-router-dom";

const Graph = ({ token }) => {
  const [progress, setProgress] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("total_kg_lifted");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress();
  }, [token]);

  const fetchProgress = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setProgress(res.data.progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const progressChartData = {
    labels: progress.map((entry) => new Date(entry.timestamp).toLocaleDateString()),
    datasets: [
      {
        label:
          selectedMetric === "total_kg_lifted"
            ? "Total Kg Lifted"
            : selectedMetric === "total_sets"
            ? "Total Sets"
            : "Total Reps",
        data: selectedMetric === "total_sets"
          ? progress.map((entry) => entry.total_sets || 0) // Map to each progress entry
          : selectedMetric === "total_reps"
          ? progress.map((entry) => entry.total_reps || 0) // Map to each progress entry
          : progress.map((entry) => entry[selectedMetric] || 0),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
        tension: 0.1,
      },
    ],
  };
  
  return (
    <Container className="mt-5 p-4 shadow bg-light" style={{width: "35rem"}}>
      <Button variant="primary" onClick={() => navigate("/dashboard")}>
        Back
      </Button>
      <h3 className="text-center">Your Progress Over Time</h3>
      <Dropdown className="mb-3">
        <Dropdown.Toggle variant="secondary">
          {selectedMetric === "total_kg_lifted"
            ? "Total Kg Lifted"
            : selectedMetric === "total_sets"
            ? "Total Sets"
            : "Total Reps"}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setSelectedMetric("total_kg_lifted")}>Total Kg Lifted</Dropdown.Item>
          <Dropdown.Item onClick={() => setSelectedMetric("total_sets")}>Total Sets</Dropdown.Item>
          <Dropdown.Item onClick={() => setSelectedMetric("total_reps")}>Total Reps</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Line data={progressChartData} />
    </Container>
  );
};

export default Graph;
