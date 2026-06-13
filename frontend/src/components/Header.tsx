import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { isLoggedIn, clearToken, isAdmin } from '../utils/auth';
import { Menu, X } from 'lucide-react';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.95);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  &:hover { opacity: 0.8; }
`;

const LogoImage = styled.img`
  height: 48px;
  width: auto;

  @media (max-width: 768px) {
    height: 36px;
  }
`;

const LogoText = styled.span`
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.div`
  position: relative;
  display: inline-block;
`;

const NavButton = styled.button`
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
  &:hover { color: #4ade80; background-color: #1a1a1a; }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #e0e0e0;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  &:hover { color: #4ade80; background-color: #1a1a1a; }
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #1a1a1a;
  min-width: 200px;
  box-shadow: 0 8px 16px rgba(255,255,255,0.1);
  border-radius: 4px;
  border: 1px solid #333;
  z-index: 1001;
  display: ${p => p.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled(Link)`
  color: #e0e0e0;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  transition: background-color 0.2s ease;
  &:hover { background-color: #2a2a2a; color: #4ade80; }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    display: none;
  }
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
  white-space: nowrap;
  &:hover { background-color: #4ade80; color: black; }
`;

const DemoButton = styled.button`
  background-color: #4ade80;
  border: none;
  color: black;
  padding: 0.65rem 1.25rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover { background-color: #22c55e; }
`;

// ── Mobile ────────────────────────────────────────────────────────────────────

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 0.25rem;
  align-items: center;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div<{ open: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${p => p.open ? 'flex' : 'none'};
    flex-direction: column;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.97);
    border-bottom: 1px solid #222;
    padding: 1rem 1.5rem 1.5rem;
    gap: 0.25rem;
    z-index: 999;
  }
`;

const MobileNavLink = styled(Link)`
  color: #e0e0e0;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 0;
  border-bottom: 1px solid #1a1a1a;
  display: block;
  &:last-of-type { border-bottom: none; }
  &:hover { color: #4ade80; }
`;

const MobileNavBtn = styled.button`
  color: #e0e0e0;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 0;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid #1a1a1a;
  font-family: inherit;
  &:hover { color: #4ade80; }
`;

const MobileSub = styled(Link)`
  color: #8a9ab0;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.5rem 0 0.5rem 1rem;
  display: block;
  &:hover { color: #4ade80; }
`;

const MobileButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

// ─────────────────────────────────────────────────────────────────────────────

const Header: React.FC = () => {
  const [whyTalosOpen, setWhyTalosOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <HeaderContainer>
        <LogoContainer as={Link} to="/" onClick={closeMobile}>
          <LogoImage src="/talos-logo.png" alt="Talos Logo" />
          <LogoText>Talos</LogoText>
        </LogoContainer>

        {/* Desktop nav */}
        <Navigation>
          <NavItem onMouseEnter={() => setWhyTalosOpen(true)} onMouseLeave={() => setWhyTalosOpen(false)}>
            <NavButton>Why Talos?</NavButton>
            <DropdownContent isOpen={whyTalosOpen}>
              <DropdownItem to="/why-talos">Why Talos</DropdownItem>
              <DropdownItem to="/why-different">Why Talos is Different</DropdownItem>
            </DropdownContent>
          </NavItem>

          <NavItem onMouseEnter={() => setProductOpen(true)} onMouseLeave={() => setProductOpen(false)}>
            <NavButton>Product</NavButton>
            <DropdownContent isOpen={productOpen}>
              <DropdownItem to="/job-board-integration">Job Board Integration</DropdownItem>
              <DropdownItem to="/job-description-writer">Job Description Writer</DropdownItem>
              {!isLoggedIn() && <DropdownItem to="/candidate-ranking">Candidate Ranking System</DropdownItem>}
              {!isLoggedIn() && <DropdownItem to="/candidate-messages">Candidate Message Generator</DropdownItem>}
              <DropdownItem to={isLoggedIn() ? '/talent-pool-manager' : '/talent-pool'}>Personalized Talent Pool</DropdownItem>
              <DropdownItem to="/hvac-insights">HVAC Hiring Insights</DropdownItem>
            </DropdownContent>
          </NavItem>

          <NavLink to="/pricing">Pricing</NavLink>
          <NavLink to="/hvac-insights">Knowledge Hub</NavLink>
          <NavLink to="/jobs">Apply to HVAC Jobs</NavLink>
        </Navigation>

        <ButtonGroup>
          {isLoggedIn() ? (
            <>
              {isAdmin() && <LoginButton onClick={() => navigate('/admin')}>Admin</LoginButton>}
              <LoginButton onClick={() => navigate('/account')}>Account</LoginButton>
              <LoginButton onClick={() => { clearToken(); navigate('/login'); }}>Logout</LoginButton>
            </>
          ) : (
            <LoginButton as={Link} to="/login">Login</LoginButton>
          )}
          <DemoButton onClick={() => navigate('/#demo')}>Get Demo</DemoButton>
        </ButtonGroup>

        {/* Hamburger */}
        <HamburgerBtn onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </HamburgerBtn>
      </HeaderContainer>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen}>
        <MobileNavBtn onClick={() => {}}>Why Talos?</MobileNavBtn>
        <MobileSub to="/why-talos" onClick={closeMobile}>Why Talos</MobileSub>
        <MobileSub to="/why-different" onClick={closeMobile}>Why Talos is Different</MobileSub>

        <MobileNavBtn onClick={() => {}}>Product</MobileNavBtn>
        <MobileSub to="/job-board-integration" onClick={closeMobile}>Job Board Integration</MobileSub>
        <MobileSub to="/job-description-writer" onClick={closeMobile}>Job Description Writer</MobileSub>
        {!isLoggedIn() && <MobileSub to="/candidate-ranking" onClick={closeMobile}>Candidate Ranking</MobileSub>}
        {!isLoggedIn() && <MobileSub to="/candidate-messages" onClick={closeMobile}>Candidate Messages</MobileSub>}
        <MobileSub to={isLoggedIn() ? '/talent-pool-manager' : '/talent-pool'} onClick={closeMobile}>Personalized Talent Pool</MobileSub>
        <MobileSub to="/hvac-insights" onClick={closeMobile}>HVAC Hiring Insights</MobileSub>

        <MobileNavLink to="/pricing" onClick={closeMobile}>Pricing</MobileNavLink>
        <MobileNavLink to="/hvac-insights" onClick={closeMobile}>Knowledge Hub</MobileNavLink>
        <MobileNavLink to="/jobs" onClick={closeMobile}>Apply to HVAC Jobs</MobileNavLink>

        <MobileButtonRow>
          {isLoggedIn() ? (
            <>
              {isAdmin() && <LoginButton onClick={() => { navigate('/admin'); closeMobile(); }}>Admin</LoginButton>}
              <LoginButton onClick={() => { navigate('/account'); closeMobile(); }}>Account</LoginButton>
              <LoginButton onClick={() => { clearToken(); navigate('/login'); closeMobile(); }}>Logout</LoginButton>
            </>
          ) : (
            <LoginButton as={Link} to="/login" onClick={closeMobile}>Login</LoginButton>
          )}
          <DemoButton onClick={() => { navigate('/#demo'); closeMobile(); }}>Get Demo</DemoButton>
        </MobileButtonRow>
      </MobileMenu>
    </>
  );
};

export default Header;
