import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { CircularProgress } from '@mui/material';

const JobApplication = ({ userId, jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobRef = doc(db, 'users', userId, 'likedJobs', jobId);
        const jobDoc = await getDoc(jobRef);
        
        if (!jobDoc.exists()) {
          throw new Error('Job not found');
        }
        
        setJob(jobDoc.data());
        
        // Fetch user profile for auto-fill
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          
          // Auto-fill form with user data
          setFormData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            coverLetter: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobDoc.data().title} position at ${jobDoc.data().company}.\n\n[Your personalized message here]\n\nThank you for considering my application.\n\nSincerely,\n${userData.fullName || 'Your Name'}`,
            resumeUrl: userData.resumeUrl || ''
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load application data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would send the application to the company
      // For now, we'll just mark it as applied in our database
      const jobRef = doc(db, 'users', userId, 'likedJobs', jobId);
      await updateDoc(jobRef, {
        applied: true,
        appliedDate: new Date(),
        applicationDetails: {
          ...formData,
          submittedAt: new Date()
        }
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><CircularProgress /></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (success) {
    return (
      <div className="success-message">
        <h3>Application Submitted!</h3>
        <p>Your application for {job.title} at {job.company} has been submitted.</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="job-application-container">
      <h2>Apply to {job.title}</h2>
      <h3>{job.company}</h3>
      
      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="coverLetter">Cover Letter</label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            rows={10}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Resume</label>
          {formData.resumeUrl ? (
            <p>Your resume is attached: {userData?.resumeName}</p>
          ) : (
            <p className="error-text">Please upload a resume in your profile first</p>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={submitting || !formData.resumeUrl}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobApplication;