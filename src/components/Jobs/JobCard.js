import React from 'react';

const JobCard = ({ job }) => {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <h4>{job.company}</h4>
      <p className="job-location">{job.location}</p>
      <p className="job-salary">{job.salary || 'Salary not specified'}</p>
      <div className="job-description">
        <p>{job.description.substring(0, 150)}...</p>
      </div>
      <div className="job-match">
        <p>Match Score: {job.matchScore}%</p>
      </div>
    </div>
  );
};

export default JobCard;// Added job company logo 
