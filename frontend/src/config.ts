// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://54.90.125.190:8081'
    : 'http://localhost:8080');

export const config = {
  apiUrl: API_BASE_URL,
  defaultSchedulingLink: 'https://your-scheduling-link.com', // Update this with your actual scheduling link (e.g., Calendly)
};
