import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AirflowAnimation from './components/AirflowAnimation';
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
import TalentPoolHome from './components/TalentPoolHome';
import JobSelectionScreen from './components/JobSelectionScreen';
import CandidateListScreen from './components/CandidateListScreen';
import HVACInsights from './components/HVACInsights';
import ResumeAnalysis from './components/ResumeAnalysis';
import BatchResumeAnalysis from './components/BatchResumeAnalysis';
import JobsManagement from './components/JobsManagement';
import GoogleAuthHandler from './components/GoogleAuthHandler';

// Lazy load PublicApply for faster initial page load (important for Indeed SEO)
const PublicApply = lazy(() => import('./components/PublicApply'));

// Minimal loading fallback for apply page
const ApplyLoadingFallback = styled.div`
  min-height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4ade80;
  font-size: 1rem;
`;

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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

// Standalone container for public apply page (no header padding)
const StandaloneContent = styled.main`
  flex: 1;
`;

// Layout wrapper that conditionally shows header/footer
function AppLayout() {
  const location = useLocation();
  const isApplyPage = location.pathname === '/apply';

  // For /apply page, render a minimal standalone version for fast load
  if (isApplyPage) {
    return (
      <>
        <GlobalStyle />
        <AppContainer>
          <StandaloneContent>
            <Suspense fallback={<ApplyLoadingFallback>Loading...</ApplyLoadingFallback>}>
              <PublicApply />
            </Suspense>
          </StandaloneContent>
        </AppContainer>
      </>
    );
  }

  // For all other pages, render full layout with header/footer
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <GoogleAuthHandler />
        <AirflowAnimation />
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
            <Route path="/talent-pool-dashboard" element={<TalentPoolHome />} />
            <Route path="/talent-pool/jobs" element={<JobSelectionScreen />} />
            <Route path="/talent-pool/candidates" element={<CandidateListScreen />} />
            <Route path="/talent-pool-old" element={<TalentPool />} />
            <Route path="/talent-pool-manager" element={<TalentPoolManager />} />
            <Route path="/hvac-insights" element={<HVACInsights />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppLayout />
    </Router>
  );
}

export default App;
