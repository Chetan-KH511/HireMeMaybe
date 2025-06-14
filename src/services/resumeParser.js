import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Function to extract text from a resume file
export const extractResumeText = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        // For simplicity, we're just reading text content
        // In a production app, you'd use a proper PDF/DOCX parser library
        const text = event.target.result;
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    // Read as text (works for text-based files)
    // For PDFs and DOCXs, you'd need specialized libraries
    reader.readAsText(file);
  });
};

// Detect profession from resume text
export const detectProfession = (text) => {
  const lowerText = text.toLowerCase();
  
  // Define profession categories and their related keywords
  const professions = [
    {
      name: 'teacher',
      keywords: ['teacher', 'teaching', 'education', 'classroom', 'curriculum', 'lesson', 'student', 
                'professor', 'instructor', 'faculty', 'school', 'university', 'college', 'tutor',
                'educational', 'academic', 'pedagogy', 'lecturer']
    },
    {
      name: 'software engineer',
      keywords: ['software', 'developer', 'programming', 'coder', 'engineer', 'web developer',
                'full stack', 'frontend', 'backend', 'devops', 'software architect', 'coding']
    },
    {
      name: 'data scientist',
      keywords: ['data scientist', 'data analyst', 'machine learning', 'ai', 'artificial intelligence',
                'statistics', 'statistical', 'analytics', 'big data', 'data mining', 'data science']
    },
    {
      name: 'healthcare',
      keywords: ['doctor', 'nurse', 'physician', 'medical', 'healthcare', 'clinical', 'hospital',
                'patient', 'medicine', 'nursing', 'health care', 'practitioner', 'therapist']
    },
    {
      name: 'finance',
      keywords: ['finance', 'financial', 'accountant', 'accounting', 'banker', 'investment',
                'analyst', 'economics', 'banking', 'auditor', 'budget', 'fiscal']
    },
    {
      name: 'marketing',
      keywords: ['marketing', 'advertiser', 'advertising', 'brand', 'market research', 'seo',
                'social media', 'content', 'digital marketing', 'campaign', 'public relations']
    },
    {
      name: 'sales',
      keywords: ['sales', 'selling', 'account manager', 'business development', 'customer',
                'client', 'revenue', 'salesperson', 'sales representative']
    },
    {
      name: 'human resources',
      keywords: ['hr', 'human resources', 'recruiter', 'recruitment', 'talent', 'hiring',
                'personnel', 'workforce', 'employee', 'staff', 'training', 'development']
    },
    {
      name: 'legal',
      keywords: ['lawyer', 'attorney', 'legal', 'law', 'counsel', 'paralegal', 'judicial',
                'litigation', 'compliance', 'regulatory', 'contract']
    },
    {
      name: 'design',
      keywords: ['designer', 'design', 'graphic', 'ui', 'ux', 'user interface', 'user experience',
                'creative', 'artist', 'illustrator', 'visual', 'product design']
    }
  ];
  
  // Count occurrences of each profession's keywords
  const professionScores = professions.map(profession => {
    let score = 0;
    profession.keywords.forEach(keyword => {
      // Count occurrences of the keyword in the text
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    return { name: profession.name, score };
  });
  
  // Sort by score (highest first)
  professionScores.sort((a, b) => b.score - a.score);
  
  // Return the top profession if it has a significant score (at least 3 matches)
  if (professionScores[0].score >= 3) {
    return professionScores[0].name;
  }
  
  // If no clear profession is detected, return a generic one
  return 'general';
};

// Extract skills from resume text
export const extractSkills = (text) => {
  // This is a more comprehensive list of skills
  const skillCategories = {
    technical: [
      'javascript', 'react', 'node', 'python', 'java', 'c++', 'c#',
      'html', 'css', 'sql', 'nosql', 'mongodb', 'firebase', 'aws',
      'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
      'typescript', 'angular', 'vue', 'express', 'django', 'flask',
      'spring', 'hibernate', 'rest', 'graphql', 'api', 'microservices'
    ],
    education: [
      'curriculum development', 'lesson planning', 'classroom management',
      'student assessment', 'educational technology', 'differentiated instruction',
      'special education', 'early childhood education', 'literacy', 'stem',
      'ib program', 'montessori', 'common core', 'distance learning'
    ],
    healthcare: [
      'patient care', 'medical records', 'clinical research', 'diagnostics',
      'treatment planning', 'medical coding', 'healthcare management',
      'patient assessment', 'vital signs', 'medical terminology'
    ],
    finance: [
      'financial analysis', 'budgeting', 'forecasting', 'accounting',
      'financial reporting', 'tax preparation', 'risk assessment',
      'investment management', 'portfolio management', 'financial planning'
    ],
    marketing: [
      'digital marketing', 'content strategy', 'seo', 'social media marketing',
      'brand management', 'market research', 'campaign management',
      'email marketing', 'analytics', 'customer acquisition'
    ],
    general: [
      'communication', 'leadership', 'project management', 'time management',
      'problem solving', 'critical thinking', 'teamwork', 'collaboration',
      'customer service', 'presentation', 'research', 'analysis',
      'organization', 'attention to detail', 'creativity', 'innovation'
    ]
  };
  
  const lowerText = text.toLowerCase();
  const foundSkills = [];
  
  // Check for skills in each category
  Object.values(skillCategories).forEach(categorySkills => {
    categorySkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
  });
  
  return foundSkills;
};

// Save extracted resume data to user's profile
export const saveResumeData = async (userId, resumeData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      resumeName: resumeData.resumeName,
      resumeSize: resumeData.resumeSize,
      resumeType: resumeData.resumeType,
      resumeLastModified: resumeData.resumeLastModified,
      resumeUpdatedAt: resumeData.resumeUpdatedAt,
      resumeKeywords: resumeData.skills,
      resumeProfession: resumeData.profession,
      keywordsUpdatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error saving resume data:', error);
    throw error;
  }
};

// Get user's resume data
export const getUserResumeData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        skills: userData.resumeKeywords || [],
        profession: userData.resumeProfession || 'general'
      };
    }
    return { skills: [], profession: 'general' };
  } catch (error) {
    console.error('Error getting resume data:', error);
    throw error;
  }
};