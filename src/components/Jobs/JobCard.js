import React from 'react';

const JobCard = ({ job }) => {
  // Function to determine match score color
  const getMatchScoreColor = (score) => {
    if (score >= 80) return '#4caf50'; // Green for high match
    if (score >= 60) return '#ff9800'; // Orange for medium match
    return '#f44336'; // Red for low match
  };
  
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <h4>{job.company}</h4>
      <p className="job-location">{job.location}</p>
      <p className="job-salary">{job.salary || 'Salary not specified'}</p>
      <div className="job-description">
        <p>{job.description.substring(0, 150)}...</p>
      </div>
      <div className="job-match" style={{ color: getMatchScoreColor(job.matchScore) }}>
        <p>Match Score: {job.matchScore}%</p>
        <div className="match-bar-container">
          <div 
            className="match-bar-fill" 
            style={{ 
              width: `${job.matchScore}%`,
              backgroundColor: getMatchScoreColor(job.matchScore)
            }}
          ></div>
        </div>
      </div>
      {job.matchingSkills && job.matchingSkills.length > 0 && (
        <div className="matching-skills">
          <h4>Your Matching Skills:</h4>
          <div className="skills-container">
            {job.matchingSkills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;// Added job company logo
