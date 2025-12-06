import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import WhyTalos from './components/WhyTalos';
import WhyTalosDifferent from './components/WhyTalosDifferent';
import JobBoardIntegration from './components/JobBoardIntegration';
import JobDescriptionWriter from './components/JobDescriptionWriter';
import CandidateRanking from './components/CandidateRanking';
import CandidateMessages from './components/CandidateMessages';
import TalentPool from './components/TalentPool';
import TalentPoolManager from './components/TalentPoolManager';
import HVACInsights from './components/HVACInsights';
import ResumeAnalysis from './components/ResumeAnalysis';
import BatchResumeAnalysis from './components/BatchResumeAnalysis';
import JobsManagement from './components/JobsManagement';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
    color: #e0e0e0;
    background-color: #000000;
  }

  html {
    scroll-behavior: smooth;
  }

  button {
    font-family: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px; /* Account for fixed header */
`;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/resume-analysis" element={<ResumeAnalysis />} />
            <Route path="/batch-resume-analysis" element={<BatchResumeAnalysis />} />
            <Route path="/jobs-management" element={<JobsManagement />} />
            <Route path="/why-talos" element={<WhyTalos />} />
            <Route path="/why-different" element={<WhyTalosDifferent />} />
            <Route path="/job-board-integration" element={<JobBoardIntegration />} />
            <Route path="/job-description-writer" element={<JobDescriptionWriter />} />
            <Route path="/candidate-ranking" element={<CandidateRanking />} />
            <Route path="/candidate-messages" element={<CandidateMessages />} />
            <Route path="/talent-pool" element={<TalentPool />} />
            <Route path="/talent-pool-manager" element={<TalentPoolManager />} />
            <Route path="/hvac-insights" element={<HVACInsights />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
}

export default App;
