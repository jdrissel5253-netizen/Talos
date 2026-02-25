import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import HeroSection from './HeroSection';
import ContentSections from './ContentSections';
import DemoModal from './DemoModal';
import { isAdmin, isLoggedIn } from '../utils/auth';

const AdminBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 2rem;
  background: rgba(74, 222, 128, 0.05);
  border-top: 1px solid rgba(74, 222, 128, 0.15);
  border-bottom: 1px solid rgba(74, 222, 128, 0.15);
`;

const AdminButton = styled.button`
  background: transparent;
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
  padding: 0.6rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(74, 222, 128, 0.1);
    border-color: #4ade80;
  }
`;

const Home: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleDemoClick = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDemoModalOpen(false);
  };

  return (
    <>
      {isAdmin() && (
        <AdminBar>
          <AdminButton onClick={() => navigate('/talent-pool-manager')}>Talent Pool</AdminButton>
          <AdminButton onClick={() => navigate('/jobs-management')}>My Jobs</AdminButton>
        </AdminBar>
      )}
      {isLoggedIn() && !isAdmin() && (
        <AdminBar>
          <AdminButton onClick={() => navigate('/dashboard')}>Dashboard</AdminButton>
        </AdminBar>
      )}
      <HeroSection onDemoClick={handleDemoClick} />
      <ContentSections />
      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default Home;