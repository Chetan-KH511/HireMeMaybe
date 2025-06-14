import axios from 'axios';

// Using the RapidAPI Jobs API (you'll need to sign up for an API key)
const RAPID_API_KEY = '79084edd1fmsh3debdd7da7ffcc8p1bb5e2jsn5b265d3c6dda'; // Replace with your actual API key

const jobsApi = axios.create({
  baseURL: 'https://jsearch.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
  }
});

export const fetchJobs = async (query, page = 1, numPages = 1) => {
  try {
    const response = await jobsApi.get('/search', {
      params: {
        query,
        page: page.toString(),
        num_pages: numPages.toString()
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const fetchJobDetails = async (jobId) => {
  try {
    const response = await jobsApi.get('/job-details', {
      params: {
        job_id: jobId
      }
    });
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
};

export const searchJobsBySkills = async (skills, page = 1, numPages = 1) => {
  // Join skills array into a string query
  const query = skills.join(' ');
  return fetchJobs(query, page, numPages);
};

export const searchJobsByLocation = async (location, page = 1, numPages = 1) => {
  return fetchJobs(`jobs in ${location}`, page, numPages);
};