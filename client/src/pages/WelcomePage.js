import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/api';
import ProfilePic from '../components/ProfilePic';

// Landing page shown when a player is not authenticated.
// Provides simple fields for their name and options to either
// log in or sign up for a new team.
export default function WelcomePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // Switch between login and signup tabs
  const [tab, setTab] = useState('login');
  // Track selfie when the signup tab is active so we can pass it along
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Destination after authentication defaults to the profile page
  const next = params.get('next') || '/roguery';

  // Basic validation shared by login and signup actions
  const validateNames = () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('First and last name are required');
      return false;
    }
    if (firstName.trim().toLowerCase() === lastName.trim().toLowerCase()) {
      alert('First and last name cannot be the same');
      return false;
    }
    return true;
  };

  // Attempt to log the user in with the provided names
  const handleLogin = async () => {
    if (!validateNames()) return;
    try {
      const { data } = await login({ firstName, lastName });
      localStorage.setItem('token', data.token);
      navigate(next || '/roguery');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  // When a selfie is chosen store both the file and preview URL
  const handleSelfieSelect = (file) => {
    setSelfieFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSelfiePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Proceed to the signup flow carrying over the entered names
  const handleSignup = () => {
    if (!validateNames()) return;
    if (!selfieFile) {
      alert('Please take or upload a photo first');
      return;
    }
    // Pass both the preview URL and the actual File object so the next step
    // can submit the selfie without requiring the user to reselect it
    navigate('/signup', {
      state: { firstName, lastName, next, selfiePreview, selfieFile }
    });
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Welcome</h2>
      {/* Tab controls above the form; active tab is styled via CSS */}
      <div className="tab-container">
        <button
          type="button"
          className={`tab ${tab === 'login' ? 'active' : ''}`}
          onClick={() => setTab('login')}
        >
          Log In
        </button>
        <button
          type="button"
          className={`tab ${tab === 'signup' ? 'active' : ''}`}
          onClick={() => setTab('signup')}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <label>Last Name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        {tab === 'signup' && (
          <>
            <label>Your Photo:</label>
            <ProfilePic avatarUrl={selfiePreview} onFileSelect={handleSelfieSelect} />
          </>
        )}

        <div style={{ marginTop: '1rem' }}>
          {tab === 'login' ? (
            <button onClick={handleLogin}>Log In</button>
          ) : (
            <button onClick={handleSignup}>Continue</button>
          )}
        </div>
      </form>
    </div>
  );
}
