import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, username, userId } = response.data;

      localStorage.setItem('username', username);
      console.log('username', username)
      localStorage.setItem('userId', userId);
      console.log('userId', userId);
      localStorage.setItem('token', token);
      navigate('/groups');
    } catch (err) {
      setError('Invalid credentials, please try again.');
      console.error('Error logging in:', err);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <p className="signup-link">
        New user? <a href="/signup">Sign up</a>
      </p>
      </form>
     
    </div>
  );
};

export default Login;
