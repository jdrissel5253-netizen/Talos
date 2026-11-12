import styled, { createGlobalStyle, css, keyframes } from 'styled-components';

// Shared look for the Interview Kits pages, matching CandidateProfile's
// dark theme (Sora + JetBrains Mono, #111318 background, #4ade80 accent).

export const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const clipCorners = css`
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
`;

export const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;
  padding-bottom: 5rem;
`;

export const TopBar = styled.div`
  border-bottom: 1px solid #232830;
  padding: 1.25rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #111318;
  position: sticky;
  top: 0;
  z-index: 50;

  @media (max-width: 768px) {
    padding: 0.9rem 1rem;
  }
`;

export const TopBarTitle = styled.h1`
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Inner = styled.div<{ $narrow?: boolean }>`
  max-width: ${p => (p.$narrow ? '720px' : '1100px')};
  margin: 0 auto;
  padding: 2rem 2.5rem 0;
  animation: ${fadeUp} 0.4s ease both;

  @media (max-width: 768px) {
    padding: 1.25rem 1rem 0;
  }
`;

export const GhostButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid #2a3040;
  color: #8a9ab0;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
  flex-shrink: 0;
  ${clipCorners}

  &:hover:not(:disabled) { border-color: #4ade80; color: #4ade80; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background: #4ade80;
  border: none;
  color: #111318;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.7rem 1.3rem;
  cursor: pointer;
  letter-spacing: 0.02em;
  ${clipCorners}

  &:hover:not(:disabled) { background: #6ee7a0; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export const Card = styled.div`
  background: #161a22;
  border: 1px solid #232830;
  margin-bottom: 1.25rem;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid #1e2330;
`;

export const CardTitle = styled.h2`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8a9ab0;
  margin: 0;
`;

export const CardBody = styled.div`
  padding: 1.1rem 1.25rem;
`;

export const Mono = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: #6e7d8e;
  letter-spacing: 0.02em;
`;

export const Badge = styled.span<{ $tone?: 'draft' | 'reviewed' | 'neutral' | 'critical' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.22rem 0.5rem;
  border: 1px solid;
  white-space: nowrap;
  ${p => {
    switch (p.$tone) {
      case 'draft': return css`color: #fbbf24; border-color: rgba(251,191,36,0.35); background: rgba(251,191,36,0.08);`;
      case 'reviewed': return css`color: #4ade80; border-color: rgba(74,222,128,0.35); background: rgba(74,222,128,0.08);`;
      case 'critical': return css`color: #f87171; border-color: rgba(248,113,113,0.35); background: rgba(248,113,113,0.08);`;
      default: return css`color: #8a9ab0; border-color: #2a3040; background: transparent;`;
    }
  }}
`;

export const Select = styled.select`
  background: #111318;
  border: 1px solid #2a3040;
  color: #c8d0dc;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  padding: 0.55rem 0.75rem;
  outline: none;
  min-width: 0;

  &:focus { border-color: #4ade80; }
`;

export const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  background: #111318;
  border: 1px solid #2a3040;
  color: #c8d0dc;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.7rem 0.85rem;
  outline: none;
  resize: vertical;
  min-height: 110px;

  &:focus { border-color: #4ade80; }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6e7d8e;
  margin-bottom: 0.4rem;
`;

export const CenterMsg = styled.div`
  text-align: center;
  color: #6e7d8e;
  font-size: 0.85rem;
  padding: 4rem 1rem;
`;

export const EmptyState = styled.div`
  border: 1px dashed #2a3040;
  padding: 3rem 1.5rem;
  text-align: center;

  h3 { color: #ffffff; font-size: 1rem; font-weight: 600; margin: 0.75rem 0 0.4rem; }
  p { color: #8a9ab0; font-size: 0.85rem; line-height: 1.6; max-width: 460px; margin: 0 auto; }
`;
