import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ResumeUpload from './components/Resume/ResumeUpload';
import JobSwiper from './components/Jobs/JobSwiper';
import LikedJobs from './components/Jobs/LikedJobs';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [showLogin, setShowLogin] = useState(true); // Toggle between login and register
  const [activeTab, setActiveTab] = useState('swiper'); // 'swiper' or 'liked'
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setResumeUrl(userData.resumeUrl);
            setResumeName(userData.resumeName);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleLogout = () => {
    auth.signOut();
  };
  
  const handleResumeUploaded = (url, name) => {
    setResumeUrl(url);
    setResumeName(name);
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Tinder For Jobs</h1>
        <p>Swipe right for your dream career</p>
        {user && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>
      
      <main>
        {!user ? (
          <div className="auth-container">
            {showLogin ? (
              <>
                <Login onLoginSuccess={(user) => setUser(user)} />
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setShowLogin(false)}>Register</button>
                </p>
              </>
            ) : (
              <>
                <Register onRegisterSuccess={(user) => setUser(user)} />
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setShowLogin(true)}>Login</button>
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Resume upload section */}
            <section className="resume-section">
              <h2>Your Resume</h2>
              {resumeUrl ? (
                <div className="resume-info">
                  <p>Current resume: {resumeName}</p>
                  <p>Upload a new resume to update your profile:</p>
                </div>
              ) : (
                <p>Upload your resume to find matching jobs</p>
              )}
              <ResumeUpload userId={user.uid} onResumeUploaded={handleResumeUploaded} />
            </section>
            
            {/* Job tabs */}
            {resumeUrl && (
              <section className="jobs-section">
                <div className="job-tabs">
                  <button 
                    className={`tab-button ${activeTab === 'swiper' ? 'active' : ''}`}
                    onClick={() => setActiveTab('swiper')}
                  >
                    Find Jobs
                  </button>
                  <button 
                    className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
                    onClick={() => setActiveTab('liked')}
                  >
                    Liked Jobs
                  </button>
                </div>
                
                {activeTab === 'swiper' ? (
                  <div className="tab-content">
                    <h2>Find Matching Jobs</h2>
                    <JobSwiper userId={user.uid} />
                  </div>
                ) : (
                  <div className="tab-content">
                    <LikedJobs userId={user.uid} />
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
