// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:8082');

export const config = {
  apiUrl: API_BASE_URL,
  defaultSchedulingLink: 'https://calendly.com/your-link', // Update this with your actual scheduling link
};
