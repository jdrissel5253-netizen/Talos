require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.NODE_ENV === 'production' ? 8080 : (process.env.PORT || 8080);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Database is already initialized via init-db.js
// No need to re-initialize on every server start

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['http://talos-hvac-frontend-1759612745.s3-website-us-east-1.amazonaws.com', 'https://talos-hvac-frontend-1759612745.s3-website-us-east-1.amazonaws.com']
        : 'http://localhost:3000'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const resumeRoutes = require('./routes/resumeRoutes');
const { router: authRoutes } = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const jobRoutes = require('./routes/jobRoutes');
const candidatePipelineRoutes = require('./routes/candidatePipelineRoutes');

// Root route
app.get('/', (req, res) => {
    res.json({
        service: 'Talos Backend API',
        version: '1.0.0',
        status: 'running',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use('/api/resume', resumeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/pipeline', candidatePipelineRoutes);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Talos Backend (Node.js)',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/demo-request', (req, res) => {
    const demoRequest = req.body;

    // Log the demo request (in a real app, you'd save to database)
    console.log('Demo Request Received:', {
        timestamp: new Date().toISOString(),
        data: demoRequest
    });

    // Simulate processing delay
    setTimeout(() => {
        res.json({
            message: 'Demo request submitted successfully',
            status: 'success',
            id: Math.random().toString(36).substr(2, 9)
        });
    }, 500);
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        message: 'Internal server error',
        status: 'error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        status: 'error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Talos Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
    console.log(`📝 Demo requests accepted at http://localhost:${PORT}/api/demo-request`);
    console.log(`📄 Resume analysis available at http://localhost:${PORT}/api/resume/upload`);
    console.log(`💼 Jobs management available at http://localhost:${PORT}/api/jobs`);
    console.log(`📋 Candidate pipeline available at http://localhost:${PORT}/api/pipeline`);
});