import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { CircularProgress } from '@mui/material';

const LikedJobs = ({ userId }) => {
  const [likedJobs, setLikedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLikedJobs = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const likedJobsRef = collection(db, 'users', userId, 'likedJobs');
        const querySnapshot = await getDocs(likedJobsRef);
        
        const jobs = [];
        querySnapshot.forEach((doc) => {
          jobs.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        
        setLikedJobs(jobs);
      } catch (err) {
        console.error('Error fetching liked jobs:', err);
        setError('Failed to load your liked jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedJobs();
  }, [userId]);

  const markAsApplied = async (jobId) => {
    try {
      const jobRef = doc(db, 'users', userId, 'likedJobs', jobId);
      await updateDoc(jobRef, {
        applied: true,
        appliedDate: new Date()
      });
      
      // Update local state
      setLikedJobs(likedJobs.map(job => 
        job.id === jobId ? { ...job, applied: true, appliedDate: new Date() } : job
      ));
    } catch (err) {
      console.error('Error updating job status:', err);
      setError('Failed to update job status. Please try again.');
    }
  };

  const removeJob = async (jobId) => {
    try {
      const jobRef = doc(db, 'users', userId, 'likedJobs', jobId);
      await deleteDoc(jobRef);
      
      // Update local state
      setLikedJobs(likedJobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error removing job:', err);
      setError('Failed to remove job. Please try again.');
    }
  };

  const handleGoApply = (publisherLink) => {
    if (publisherLink) {
      window.open(publisherLink, '_blank');
    }
  };

  if (loading) {
    return <div className="loading-container"><CircularProgress /></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (likedJobs.length === 0) {
    return <div className="no-jobs-message">You haven't liked any jobs yet. Start swiping to find jobs!</div>;
  }

  return (
    <div className="liked-jobs-container">
      <h2>Your Liked Jobs</h2>
      <div className="liked-jobs-list">
        {likedJobs.map((job) => (
          <div key={job.id} className={`liked-job-card ${job.applied ? 'applied' : ''}`}>
            <div className="job-details">
              <h3>{job.title}</h3>
              <h4>{job.company}</h4>
              <p className="liked-date">Liked on: {job.likedAt?.toDate().toLocaleDateString()}</p>
              {job.applied && (
                <p className="applied-badge">Applied ✓</p>
              )}
            </div>
            <div className="job-actions">
              {job.publisherLink && (
                <button 
                  className="apply-button primary" 
                  onClick={() => handleGoApply(job.publisherLink)}
                >
                  Go Apply
                </button>
              )}
              {!job.applied && (
                <button 
                  className="apply-button" 
                  onClick={() => markAsApplied(job.id)}
                >
                  Mark as Applied
                </button>
              )}
              <button 
                className="remove-button" 
                onClick={() => removeJob(job.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedJobs;