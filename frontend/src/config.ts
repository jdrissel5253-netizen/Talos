// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://talos-backend-prod.eba-2gkfngyg.us-east-1.elasticbeanstalk.com'
    : 'http://localhost:8082');

export const config = {
  apiUrl: API_BASE_URL,
};
