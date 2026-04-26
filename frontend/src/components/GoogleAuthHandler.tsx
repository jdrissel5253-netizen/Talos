import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleAuthHandler: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const connected = params.get('gmail_connected');
        const error = params.get('gmail_error');

        if (connected || error) {
            // Strip the query params and stay on the current page
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    return null;
};

export default GoogleAuthHandler;
