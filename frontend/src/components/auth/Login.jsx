import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaGraduationCap, FaLock, FaUser, FaEnvelope, FaIdCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { registerTeacher } from '../../api/api';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: 'teacher',
    password: 'password123',
  });

  // Register form state
  const [regForm, setRegForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password) {
      toast.error('Please enter both username and password');
      return;
    }

    setSubmitting(true);
    try {
      await login(loginForm);
      toast.success('Welcome back to the Academic Management System!');
      navigate('/');
    } catch (err) {
      const msg = err.userMessage || err.response?.data?.message || 'Invalid username or password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.username.trim() || !regForm.password || !regForm.fullName.trim() || !regForm.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await registerTeacher(regForm);
      toast.success('Account created successfully! Please log in with your credentials.');
      setIsRegistering(false);
      setLoginForm({ username: regForm.username, password: regForm.password });
    } catch (err) {
      const msg = err.userMessage || err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-icon">
            <FaGraduationCap size={36} />
          </div>
          <h2>Academic Management System</h2>
          <p className="text-muted">Teacher &amp; Staff Academic Portal</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegistering ? 'active' : ''}`}
            onClick={() => setIsRegistering(false)}
          >
            Teacher Login
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegistering ? 'active' : ''}`}
            onClick={() => setIsRegistering(true)}
          >
            Register Staff
          </button>
        </div>

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  id="login-username"
                  type="text"
                  placeholder="e.g. teacher or admin"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="demo-credentials-box">
              <span className="demo-title">Default Demo Credentials:</span>
              <code>teacher / password123</code> (Teacher Role)
              <br />
              <code>admin / admin123</code> (Admin Role)
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-fullname">Full Name *</label>
              <div className="input-with-icon">
                <FaIdCard className="input-icon" />
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="e.g. Prof. Alan Turing"
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address *</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="e.g. alan.turing@school.edu"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-username">Username *</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  placeholder="Choose a username"
                  value={regForm.username}
                  onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password *</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  id="reg-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creating Account...' : 'Register as Teacher'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
