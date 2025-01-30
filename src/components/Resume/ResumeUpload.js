import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ResumeUpload = ({ userId, onResumeUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
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
      
      // Instead of uploading the file, we'll store the resume information
      const resumeInfo = {
        resumeName: file.name,
        resumeSize: file.size,
        resumeType: file.type,
        resumeLastModified: new Date(file.lastModified),
        resumeUpdatedAt: new Date()
      };
      
      // Update the user's document with the resume information
      await updateDoc(doc(db, 'users', userId), resumeInfo);
      
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
        {uploading ? 'Saving...' : 'Save Resume Information'}
      </button>
    </div>
  );
};

export default ResumeUpload;