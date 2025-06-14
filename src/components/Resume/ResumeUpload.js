import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { extractResumeText, detectProfession, extractSkills, saveResumeData } from '../../services/resumeParser';

const ResumeUpload = ({ userId, onResumeUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [detectedProfession, setDetectedProfession] = useState('');
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || 
        selectedFile.type === 'application/msword' || 
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid resume file (PDF or Word document)');
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    if (!userId) {
      setError('You must be logged in to upload a resume');
      return;
    }
    
    try {
      setUploading(true);
      
      // Extract text from resume (simplified version)
      const resumeText = await extractResumeText(file);
      
      // Detect profession from resume text
      const profession = detectProfession(resumeText);
      setDetectedProfession(profession);
      
      // Extract skills from resume text
      const skills = extractSkills(resumeText);
      setExtractedSkills(skills);
      
      // Store the resume information
      const resumeInfo = {
        resumeName: file.name,
        resumeSize: file.size,
        resumeType: file.type,
        resumeLastModified: new Date(file.lastModified),
        resumeUpdatedAt: new Date(),
        skills: skills,
        profession: profession
      };
      
      // Save resume data to user's profile
      await saveResumeData(userId, resumeInfo);
      
      // Call the callback function with the resume info
      if (onResumeUploaded) {
        onResumeUploaded(resumeInfo);
      }
      
      setUploading(false);
      setFile(null);
      
      console.log('Resume information saved successfully!');
      
    } catch (error) {
      setError('Error saving resume information: ' + error.message);
      setUploading(false);
    }
  };
  
  return (
    <div className="resume-upload">
      <h3>Upload Your Resume</h3>
      <p>Add your resume information to find matching jobs</p>
      
      <input 
        type="file" 
        accept=".pdf,.doc,.docx" 
        onChange={handleFileChange} 
        disabled={uploading}
      />
      
      {error && <p className="error">{error}</p>}
      
      {file && (
        <div className="selected-file">
          <p>Selected file: {file.name}</p>
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
      >
        {uploading ? 'Analyzing Resume...' : 'Save Resume Information'}
      </button>
      
      {detectedProfession && (
        <div className="profession-container">
          <h4>Detected Profession:</h4>
          <p className="profession-tag">{detectedProfession}</p>
        </div>
      )}
      
      {extractedSkills.length > 0 && (
        <div className="keywords-container">
          <h4>Skills detected in your resume:</h4>
          <div className="keywords-list">
            {extractedSkills.map((skill, index) => (
              <span key={index} className="keyword-pill">{skill}</span>
            ))}
          </div>
          <p className="keywords-help">These skills will be used to find matching jobs</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;