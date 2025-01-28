import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import JobCard from './JobCard';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { fetchJobs } from '../../services/jobApi';
import { CircularProgress } from '@mui/material';

const JobSwiper = ({ userId }) => {
  const [jobs, setJobs] = useState([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        // You can customize the search query based on user preferences or resume keywords
        const jobsData = await fetchJobs('software developer', 1, 10);
        
        if (jobsData && jobsData.length > 0) {
          // Transform the API data to match our app's format
          const formattedJobs = jobsData.map(job => ({
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
            salary: job.job_min_salary && job.job_max_salary ? 
              `$${job.job_min_salary}-$${job.job_max_salary}` : 'Salary not specified',
            description: job.job_description || 'No description available',
            matchScore: Math.floor(Math.random() * 30) + 70, // Mock match score for now
            applyLink: job.job_apply_link,
            jobDetails: job
          }));
          
          setJobs(formattedJobs);
        } else {
          setError('No jobs found. Try adjusting your search criteria.');
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);
  
  const handleSwipeLeft = () => {
    if (swiping || loading) return;
    setSwiping(true);
    
    // Skip this job
    if (currentJobIndex < jobs.length - 1) {
      setCurrentJobIndex(currentJobIndex + 1);
    }
    
    setTimeout(() => setSwiping(false), 300); // Prevent rapid swiping
  };
  
  const handleSwipeRight = async () => {
    if (swiping || loading) return;
    setSwiping(true);
    setLoading(true);
    setError(null);
    
    const currentJob = jobs[currentJobIndex];
    
    try {
      // Save the liked job to Firestore with more details
      if (!userId) {
        throw new Error('You must be logged in to like jobs');
      }
      
      await addDoc(collection(db, 'users', userId, 'likedJobs'), {
        jobId: currentJob.id,
        title: currentJob.title,
        company: currentJob.company,
        location: currentJob.location,
        description: currentJob.description.substring(0, 200) + '...',
        applyLink: currentJob.applyLink,
        publisherLink: currentJob.jobDetails?.publisher_link || currentJob.applyLink, // Add publisher link
        likedAt: new Date(),
        applied: false
      });
      
      // Move to the next job
      if (currentJobIndex < jobs.length - 1) {
        setCurrentJobIndex(currentJobIndex + 1);
      }
    } catch (error) {
      console.error('Error saving liked job:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setSwiping(false), 300); // Prevent rapid swiping
    }
  };
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  
  if (loading && jobs.length === 0) {
    return <div className="loading-container"><CircularProgress /></div>;
  }
  
  if (error && jobs.length === 0) {
    return <div className="error-message">{error}</div>;
  }
  
  if (jobs.length === 0) {
    return <div className="no-jobs">No jobs available at the moment.</div>;
  }
  
  if (currentJobIndex >= jobs.length) {
    return <div className="no-more-jobs">No more jobs to show. Check back later!</div>;
  }
  
  return (
    <div className="job-swiper-container">
      <div className="swipe-instructions">
        <p>Swipe right to like, swipe left to skip</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div {...swipeHandlers} className="swipeable-card-container">
        <JobCard job={jobs[currentJobIndex]} />
      </div>
      
      <div className="swipe-buttons">
        <button 
          className={`skip-button ${swiping || loading ? 'disabled' : ''}`}
          onClick={handleSwipeLeft}
          disabled={swiping || loading}
        >
          Skip
        </button>
        <button 
          className={`like-button ${swiping || loading ? 'disabled' : ''}`}
          onClick={handleSwipeRight}
          disabled={swiping || loading}
        >
          {loading ? 'Saving...' : 'Like'}
        </button>
      </div>
    </div>
  );
};

export default JobSwiper;// Added swipe animation effects 
const animateSwipe = (direction) =
  // Animation logic 
}; 
