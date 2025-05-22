import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


// BOOTSTRAP

import { Form, FloatingLabel, Button, Container, Card } from "react-bootstrap";


function SignIn({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      navigate("/dashboard");
    } catch {
      alert("Invalid email or password.");
    }
  };

  return (
   
      
    <Container className="d-flex justify-content-center align-items-center vh-100 pb-5">
      
      <Card className="p-4 shadow-lg" style={{ width: "25rem" }}>
      <h3 className="text-center mb-4 w-100 fw-bold">Let's Workout</h3>
        <h2 className="text-center mb-4">Sign In</h2>
        <Form onSubmit={handleLogin}>
          <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3">
            <Form.Control 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </FloatingLabel>

          <FloatingLabel controlId="floatingPassword" label="Password" className="mb-3">
            <Form.Control 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </FloatingLabel>

          <Button variant="primary" type="submit" className="w-100">
            Sign In
          </Button>
        </Form>

        <p className="mt-3 text-center">
          Don't have an account? <Button variant="link" onClick={() => navigate("/signup")}>Sign Up</Button>
        </p>
      </Card>
    </Container>
    
    
   

  );
}

export default SignIn;
