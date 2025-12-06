import React, { useState } from 'react';
import HeroSection from './HeroSection';
import ContentSections from './ContentSections';
import DemoModal from './DemoModal';

const Home: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleDemoClick = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDemoModalOpen(false);
  };

  return (
    <>
      <HeroSection onDemoClick={handleDemoClick} />
      <ContentSections />
      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default Home;