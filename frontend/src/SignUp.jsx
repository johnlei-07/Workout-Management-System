import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// BOOTTRAP
import {Container, Card, Form, FloatingLabel, Button} from 'react-bootstrap'

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return; 
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/register",
        { email, password, confirm_password: confirmPassword },
        { headers: { "Content-Type": "application/json" } }
      );  
  
      alert(response.data.message);  // Success message from backend
      navigate("/");
    }catch (error) {
      alert(error.response?.data?.message || "Error registering user.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg" style={{width: "25rem"}}>
        <h2 className="text-center mb-4">Sign in</h2>
        <Form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <FloatingLabel controlId="floatingEmail" label="Email Address" className="mb-3">
            <Form.Control
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </FloatingLabel>
          {/* PASSWORD */}
          <FloatingLabel controlId="floatingPassword" label="Password" className="mb-3">
            <Form.Control
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
          </FloatingLabel>
          {/* CONFIRM PASSWORD */}
          <FloatingLabel controlId="floatingConfirmPassword" label="Confirm Password" className="mb-3">
            <Form.Control
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            /> 
          </FloatingLabel>
          <Button variant="primary" type="submit" className="w-100">
            Sign Up
          </Button>
          <p className="mt-3 text-center">
            Already have account?
            <Button variant="link" onClick={()=> navigate("/")} >
              Sign In
            </Button>
          </p>

        </Form>
      </Card>
    </Container>
    // <div>
    //   <h2>Sign Up</h2>
    //   <form onSubmit={handleSubmit}>
    //     <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
    //     <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
    //     <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} required />
    //     <button type="submit">Sign Up</button>
    //   </form>
    // </div>
  );
}

export default SignUp;
