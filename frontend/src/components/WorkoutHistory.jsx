import React, { useState } from "react";
import { ListGroup, Button, Modal, Container } from "react-bootstrap";
import axios from "axios";

function WorkoutHistory({ token, history, fetchWorkouts }) {
  const [loading, setLoading] = useState(false);
  const [showPermaDeleteModal, setShowPermaDeleteModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState(null);

  const permanentlyDeleteWorkout = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://127.0.0.1:5000/workouts/history/${selectedWorkoutIndex}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPermaDeleteModal(false);
      fetchWorkouts();  // Refresh the workouts and history
    } catch (error) {
      alert(`Failed to permanently delete workout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const recoverWorkout = async () => {
    try {
      setLoading(true);
      await axios.put(`http://127.0.0.1:5000/workouts/recover/${selectedWorkoutIndex}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowRecoverModal(false);
      fetchWorkouts();  // Refresh the workouts and history
    } catch (error) {
      alert(`Failed to recover workout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h4 className="mt-4">Workout History</h4>
      <ListGroup>
        {history && history.length > 0 ? (
          history.map((workout, index) => (
            <ListGroup.Item
              key={index}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{workout.name} :</strong> {workout.sets} sets, {workout.reps} reps, {workout.kg} kg
                <br></br> {new Date(workout.timestamp).toLocaleString()}
              </div>
              <div>
                <Button
                  variant="danger"
                  size="sm"
                  className="me-2"
                  onClick={() => {
                    setSelectedWorkoutIndex(index);
                    setShowPermaDeleteModal(true);
                  }}
                >
                  Permanently Delete
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedWorkoutIndex(index);
                    setShowRecoverModal(true);
                  }}
                >
                  Recover
                </Button>
              </div>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item>No workout history available</ListGroup.Item>
        )}
      </ListGroup>

      {/* Permanently Delete Confirmation Modal */}
      <Modal show={showPermaDeleteModal} onHide={() => setShowPermaDeleteModal(false)}>
        <Modal.Header>
          <Container className="bg-danger text-center p-2 text-light rounded">
            <Modal.Title>Confirm Permanently Deletion</Modal.Title>
          </Container>
        </Modal.Header>
        <Modal.Body>Are you sure you want to Delete permanently this workout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPermaDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={permanentlyDeleteWorkout}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Recovery Confirmation Modal */}
      <Modal show={showRecoverModal} onHide={() => setShowRecoverModal(false)} >
        <Modal.Header>
          <Container className="text-light text-center rounded bg-primary p-2">
          <Modal.Title>Confirm Recovery</Modal.Title>
          </Container>
        </Modal.Header>
        <Modal.Body>Are you sure you want to Recover this workout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecoverModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={recoverWorkout}>
            Recover
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default WorkoutHistory;