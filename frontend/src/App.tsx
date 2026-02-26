import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AirflowAnimation from './components/AirflowAnimation';
import Home from './components/Home';
import Login from './components/Login';
import GoogleAuthHandler from './components/GoogleAuthHandler';

// Lazy load all non-critical routes
const JobsManagement = lazy(() => import('./components/JobsManagement'));
const BatchResumeAnalysis = lazy(() => import('./components/BatchResumeAnalysis'));
const TalentPoolManager = lazy(() => import('./components/TalentPoolManager'));
const ResumeAnalysis = lazy(() => import('./components/ResumeAnalysis'));
const WhyTalos = lazy(() => import('./components/WhyTalos'));
const WhyTalosDifferent = lazy(() => import('./components/WhyTalosDifferent'));
const JobBoardIntegration = lazy(() => import('./components/JobBoardIntegration'));
const JobDescriptionWriter = lazy(() => import('./components/JobDescriptionWriter'));
const CandidateRanking = lazy(() => import('./components/CandidateRanking'));
const CandidateMessages = lazy(() => import('./components/CandidateMessages'));
const TalentPool = lazy(() => import('./components/TalentPool'));
const TalentPoolHome = lazy(() => import('./components/TalentPoolHome'));
const ClientDashboard = lazy(() => import('./components/ClientDashboard'));
const JobSelectionScreen = lazy(() => import('./components/JobSelectionScreen'));
const CandidateListScreen = lazy(() => import('./components/CandidateListScreen'));
const HVACInsights = lazy(() => import('./components/HVACInsights'));
const PublicApply = lazy(() => import('./components/PublicApply'));
const PublicJobDetail = lazy(() => import('./components/PublicJobDetail'));

// Loading fallback for lazy-loaded routes
const LoadingFallback = styled.div`
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
  const isPublicJobPage = location.pathname.startsWith('/jobs/');

  // For public pages (/apply, /jobs/:id), render a minimal standalone version for fast load
  if (isApplyPage || isPublicJobPage) {
    return (
      <>
        <GlobalStyle />
        <AppContainer>
          <StandaloneContent>
            <Suspense fallback={<LoadingFallback>Loading...</LoadingFallback>}>
              <Routes>
                <Route path="/apply" element={<PublicApply />} />
                <Route path="/jobs/:id" element={<PublicJobDetail />} />
              </Routes>
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
          <Suspense fallback={<LoadingFallback>Loading...</LoadingFallback>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ClientDashboard />} />
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
          </Suspense>
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
