import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// BOOTSTRAP
import { Container, Row, Col, Card, Form, Button, ListGroup, Modal } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

import Navbar from "./components/Navbar";
import WorkoutHistory from "./components/WorkoutHistory";

function Dashboard({ token }) {
  const [userEmail, setUserEmail] = useState(""); 
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [history, setHistory] = useState([]);
  const [newWorkout, setNewWorkout] = useState({ name: "", sets: 0, reps: 0, kg: 0 });
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);  // Loading state for API calls
  const [selectedMetric, setSelectedMetric] = useState("total_kg_lifted");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkouts();
    fetchProgress();
  }, [token]);

  // Reusable API call function with error handling
  const fetchData = async (url, setter) => {
    try {
      setLoading(true);
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setter(res.data);
    } catch (error) {
      alert(`Failed to fetch data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkouts = () => fetchData("http://127.0.0.1:5000/workouts", (data) => {
    setWorkouts(data.workouts);
    setHistory(data.history);
    setUserEmail(data.email);
  });

  const fetchProgress = () => fetchData("http://127.0.0.1:5000/progress", (data) => setProgress(data.progress));

  const progressChartData = {
    labels: progress.map((entry) => new Date(entry.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: selectedMetric === 'total_kg_lifted' ? "Total Kg Lifted" : selectedMetric === 'sets' ? "Total Sets" : "Total Reps",
        data: progress.map((entry) => entry[selectedMetric] || 0), // Ensure that we always return a value, default to 0 if missing
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const addWorkout = async () => {
    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:5000/workouts", newWorkout, { headers: { Authorization: `Bearer ${token}` } });
      setNewWorkout({ name: "", sets: 0, reps: 0, kg: 0 });
      fetchWorkouts();
    } catch (error) {
      alert(`Failed to add workout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkout = async (index) => {
    try {
      setLoading(true);
      await axios.put(`http://127.0.0.1:5000/workouts/${index}`, newWorkout, { headers: { Authorization: `Bearer ${token}` } });
      setNewWorkout({ name: "", sets: 0, reps: 0, kg: 0 });
      setEditIndex(null);
      fetchWorkouts();
    } catch (error) {
      alert(`Failed to update workout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://127.0.0.1:5000/workouts/${selectedWorkoutIndex}`, { headers: { Authorization: `Bearer ${token}` } });
      setShowDeleteModal(false);
      fetchWorkouts();
    } catch (error) {
      alert(`Failed to delete workout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (index) => {
    const workoutToEdit = workouts[index];
    setNewWorkout({
      name: workoutToEdit.name,
      sets: workoutToEdit.sets,
      reps: workoutToEdit.reps,
      kg: workoutToEdit.kg,
    });
    setEditIndex(index);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
 

  const handleDeleteConfirmation = (index) => {
    setSelectedWorkoutIndex(index);
    setShowDeleteModal(true);
    
  };
  

  return (
    <>
    <Navbar/>
    <Container className="mt-5">
      <Card className="mb-4 p-3">
        <div className="d-flex justify-content-between align-items-center">
          <h3>Welcome back {userEmail && <span className="text-primary"> {userEmail}</span>}</h3>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
      <Row>
        {/* Left Column - Workout Form */}
        <Col md={6} className="d-flex justify-content-center">
          <Card className="p-4 shadow" style={{ width: "25rem", height: "24rem" }}>
            <h3 className="text-center">{editIndex !== null ? "Edit Workout" : "Add Workout"}</h3>
            <Form>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Workout Name"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  placeholder="Sets"
                  value={newWorkout.sets}
                  onChange={(e) => setNewWorkout({ ...newWorkout, sets: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  placeholder="Reps"
                  value={newWorkout.reps}
                  onChange={(e) => setNewWorkout({ ...newWorkout, reps: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  placeholder="Kg"
                  value={newWorkout.kg}
                  onChange={(e) => setNewWorkout({ ...newWorkout, kg: Number(e.target.value) })}
                />
              </Form.Group>
              <Button
                variant={editIndex !== null ? "warning" : "primary"}
                onClick={editIndex !== null ? () => updateWorkout(editIndex) : addWorkout}
                className="w-100"
                disabled={loading}
              >
                {editIndex !== null ? "Update" : "Add"}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Workout List & History */}
        <Col md={6}>
          <Card className="p-4 shadow">
            <div className="d-flex justify-content-between align-items-center">
              <h4>Your Workouts</h4>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>

            <ListGroup className="mt-3">
              {workouts.map((workout, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{workout.name}</strong> - {workout.sets} sets, {workout.reps} reps, {workout.kg} kg
                  </div>
                  <div>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditClick(index)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteConfirmation(index)}>
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Container className="d-flex justify-content-center align-items-center mt-4">
              <Button variant="primary" style={{width: "15rem"}} onClick={() => navigate("/graph")}>See your progress overtime</Button>  
            </Container>        

            {/* Workout History Component */}
            <WorkoutHistory 
              token={token} 
              history={history} 
              fetchWorkouts={fetchWorkouts} 
            />
            
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this workout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteWorkout}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
}

export default Dashboard;
