import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import JobCard from './JobCard';
import { db } from '../../services/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { fetchJobs } from '../../services/jobApi';
import { getUserResumeData } from '../../services/resumeParser';
import { CircularProgress } from '@mui/material';

const JobSwiper = ({ userId }) => {
  const [jobs, setJobs] = useState([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userResumeData, setUserResumeData] = useState({ skills: [], profession: 'general' });
  
  useEffect(() => {
    const loadUserResumeData = async () => {
      if (userId) {
        try {
          const resumeData = await getUserResumeData(userId);
          setUserResumeData(resumeData);
          return resumeData;
        } catch (err) {
          console.error('Error loading user resume data:', err);
          return { skills: [], profession: 'general' };
        }
      }
      return { skills: [], profession: 'general' };
    };
    
    const loadJobs = async () => {
      try {
        setLoading(true);
        
        // Get user's resume data
        const resumeData = await loadUserResumeData();
        const { skills, profession } = resumeData;
        
        let jobsData;
        let searchQuery;
        
        // Use profession for job search if available
        if (profession && profession !== 'general') {
          searchQuery = profession + ' jobs';
          console.log('Searching jobs for profession:', profession);
        } else if (skills && skills.length > 0) {
          // Fall back to skills if no profession detected
          searchQuery = skills.slice(0, 3).join(' ');
          console.log('Searching jobs with skills:', searchQuery);
        } else {
          // Default search if no profession or skills available
          searchQuery = 'entry level jobs';
          console.log('No profession or skills found, using default search');
        }
        
        // Fetch jobs based on the search query
        jobsData = await fetchJobs(searchQuery, 1, 10);
        
        if (jobsData && jobsData.length > 0) {
          // Transform the API data to match our app's format
          const formattedJobs = jobsData.map(job => {
            // Calculate realistic match score based on skills and job description
            let matchScore = calculateMatchScore(job, skills, profession);
            
            return {
              id: job.job_id,
              title: job.job_title,
              company: job.employer_name,
              location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
              salary: job.job_min_salary && job.job_max_salary ? 
                `$${job.job_min_salary}-$${job.job_max_salary}` : 'Salary not specified',
              description: job.job_description || 'No description available',
              matchScore: matchScore,
              matchingSkills: getMatchingSkills(job, skills),
              applyLink: job.job_apply_link,
              jobDetails: job
            };
          });
          
          // Sort jobs by match score (highest first)
          formattedJobs.sort((a, b) => b.matchScore - a.matchScore);
          
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
  }, [userId]);
  
  // Calculate a realistic match score between 30-95%
  const calculateMatchScore = (job, userSkills, userProfession) => {
    // Base score starts at 30%
    let score = 30;
    
    if (!job.job_description) return score;
    
    const jobDescription = job.job_description.toLowerCase();
    const jobTitle = job.job_title.toLowerCase();
    
    // Check if job title matches user's profession (up to 30 points)
    if (userProfession && userProfession !== 'general') {
      if (jobTitle.includes(userProfession)) {
        score += 30;
      } else if (jobDescription.includes(userProfession)) {
        score += 15;
      }
    }
    
    // Check for matching skills (up to 35 points)
    if (userSkills && userSkills.length > 0) {
      let skillMatches = 0;
      
      userSkills.forEach(skill => {
        if (jobDescription.includes(skill.toLowerCase()) || 
            jobTitle.includes(skill.toLowerCase())) {
          skillMatches++;
        }
      });
      
      // Calculate skill match percentage (max 35 points)
      const skillPoints = Math.min(35, (skillMatches / Math.min(userSkills.length, 10)) * 35);
      score += skillPoints;
    }
    
    // Add some randomness to avoid all jobs having the same score (±5 points)
    score += Math.floor(Math.random() * 10) - 5;
    
    // Ensure score is between 30 and 95
    return Math.max(30, Math.min(95, Math.round(score)));
  };
  
  // Get matching skills between job and user skills
  const getMatchingSkills = (job, userSkills) => {
    if (!userSkills || userSkills.length === 0 || !job.job_description) {
      return [];
    }
    
    const jobDescription = job.job_description.toLowerCase();
    const jobTitle = job.job_title.toLowerCase();
    
    return userSkills.filter(skill => 
      jobDescription.includes(skill.toLowerCase()) || 
      jobTitle.includes(skill.toLowerCase())
    );
  };
  
  // Rest of the component remains the same
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
        publisherLink: currentJob.jobDetails?.publisher_link || currentJob.applyLink,
        matchScore: currentJob.matchScore,
        matchingSkills: currentJob.matchingSkills,
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
      {userResumeData.profession && userResumeData.profession !== 'general' && (
        <div className="profession-info">
          <p>Showing jobs for: <strong>{userResumeData.profession}</strong></p>
        </div>
      )}
      
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

export default JobSwiper;