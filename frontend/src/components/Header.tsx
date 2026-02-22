import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { isLoggedIn, clearToken } from '../utils/auth';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.9);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
`;

const LogoText = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
`;
const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavItem = styled.div`
  position: relative;
  display: inline-block;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #e0e0e0;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    color: #4ade80;
    background-color: #1a1a1a;
  }
`;

const NavButton = styled.button`
  text-decoration: none;
  color: #e0e0e0;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  background: none;
  border: none;
  font-size: inherit;
  font-family: inherit;

  &:hover {
    color: #4ade80;
    background-color: #1a1a1a;
  }
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #1a1a1a;
  min-width: 200px;
  box-shadow: 0 8px 16px rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid #333333;
  z-index: 1001;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled(Link)`
  color: #e0e0e0;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2a2a2a;
    color: #4ade80;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LoginButton = styled.button`
  background: transparent;
  border: 1px solid #4ade80;
  color: #4ade80;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #4ade80;
    color: black;
  }
`;

const DemoButton = styled.button`
  background-color: #4ade80;
  border: none;
  color: black;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #22c55e;
    transform: translateY(-1px);
  }
`;

const Header: React.FC = () => {
  const [whyTalosOpen, setWhyTalosOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <LogoContainer as={Link} to="/">
        <LogoImage src="/talos-logo.png" alt="Talos Logo" />
        <LogoText>Talos</LogoText>
      </LogoContainer>

      <Navigation>
        <NavItem
          onMouseEnter={() => setWhyTalosOpen(true)}
          onMouseLeave={() => setWhyTalosOpen(false)}
        >
          <NavButton>Why Talos?</NavButton>
          <DropdownContent isOpen={whyTalosOpen}>
            <DropdownItem to="/why-talos">Why Talos</DropdownItem>
            <DropdownItem to="/why-different">Why Talos is Different</DropdownItem>
          </DropdownContent>
        </NavItem>

        <NavItem
          onMouseEnter={() => setProductOpen(true)}
          onMouseLeave={() => setProductOpen(false)}
        >
          <NavButton>Product</NavButton>
          <DropdownContent isOpen={productOpen}>
            <DropdownItem to="/job-board-integration">Job Board Integration</DropdownItem>
            <DropdownItem to="/job-description-writer">Job Description Writer</DropdownItem>
            <DropdownItem to="/candidate-ranking">Candidate Ranking System</DropdownItem>
            <DropdownItem to="/candidate-messages">Candidate Message Generator</DropdownItem>
            <DropdownItem to="/talent-pool">Personalized Talent Pool</DropdownItem>
            <DropdownItem to="/hvac-insights">HVAC Hiring Insights</DropdownItem>

          </DropdownContent>
        </NavItem>

        <NavLink to="/#pricing">Pricing</NavLink>
        <NavLink to="/#knowledge-hub">Knowledge Hub</NavLink>
      </Navigation>

      <ButtonGroup>
        {isLoggedIn() ? (
          <LoginButton onClick={() => { clearToken(); navigate('/login'); }}>Logout</LoginButton>
        ) : (
          <LoginButton as={Link} to="/login">Login</LoginButton>
        )}
        <DemoButton onClick={() => navigate('/#demo')}>Get Demo</DemoButton>
      </ButtonGroup>
    </HeaderContainer>
  );
};

export default Header;