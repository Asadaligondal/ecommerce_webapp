// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

// Import Login page styles (we'll create this next)
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth(); // Get login function and isAuthenticated status
  const navigate = useNavigate(); // Hook for navigation

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    navigate('/');
    return null; // Don't render anything
  }

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors

    if (login(username, password)) {
      // Login successful, redirect to home or dashboard
      navigate('/'); // Redirect to home page
    } else {
      setError('Invalid username or password.'); // Set error message
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      {error && <p className="login-error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;