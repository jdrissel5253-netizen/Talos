import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { config as appConfig } from '../config';

// ─── styled components ─────────────────────────────────────────────────────────

const GetStartedCard = styled.div`
  border: 1px solid #2a3a2a;
  background: linear-gradient(135deg, #111a14 0%, #111318 100%);
  margin-bottom: 2rem;
  padding: 2rem 2.5rem;

  @media (max-width: 600px) { padding: 1.5rem; }
`;

const GetStartedHeading = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
`;

const GetStartedSub = styled.p`
  font-size: 0.78rem;
  color: #6e7d8e;
  margin-bottom: 1.75rem;
`;

const HeaderRow = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
`;

const HeaderTitle = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const StepCount = styled.span`
  font-size: 0.72rem;
  color: #6e7d8e;
  font-weight: 500;
`;

const Chevron = styled(ChevronDown)<{ $expanded: boolean }>`
  color: #6e7d8e;
  flex-shrink: 0;
  transition: transform 0.15s ease;
  transform: rotate(${p => p.$expanded ? '180deg' : '0deg'});
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StepRow = styled.div<{ state: 'done' | 'active' | 'locked' }>`
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #1e2330;
  opacity: ${p => p.state === 'locked' ? 0.4 : 1};

  &:last-child { border-bottom: none; }
`;

const StepIcon = styled.div<{ state: 'done' | 'active' | 'locked' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
  background: ${p => p.state === 'done' ? 'rgba(74,222,128,0.12)' : p.state === 'active' ? 'rgba(74,222,128,0.08)' : '#1a1f2a'};
  border: 1px solid ${p => p.state === 'done' ? '#4ade80' : p.state === 'active' ? 'rgba(74,222,128,0.4)' : '#232830'};
  color: ${p => p.state === 'done' ? '#4ade80' : p.state === 'active' ? '#4ade80' : '#6e7d8e'};
`;

const StepText = styled.div``;

const StepTitle = styled.div<{ state: 'done' | 'active' | 'locked' }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.state === 'done' ? '#6e7d8e' : '#e0e0e0'};
  text-decoration: ${p => p.state === 'done' ? 'line-through' : 'none'};
  letter-spacing: -0.01em;
`;

const StepDesc = styled.div`
  font-size: 0.72rem;
  color: #6e7d8e;
  margin-top: 0.15rem;
`;

const StepHintList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
`;

const StepHintPill = styled.span`
  font-size: 0.64rem;
  font-family: 'JetBrains Mono', monospace;
  color: #8a94a6;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
`;

const StepBtn = styled.button`
  background: #4ade80;
  border: none;
  color: #000;
  font-family: 'Sora', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.45rem 1rem;
  cursor: pointer;
  white-space: nowrap;
  clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  transition: background 0.15s ease;

  &:hover { background: #6ee89a; }
`;

// ─── component ────────────────────────────────────────────────────────────────

interface JobLite { id: number; status: string; }

interface OnboardingChecklistProps {
  /** Card heading. Defaults to the first-run copy. */
  heading?: string;
  /** Card subheading. Defaults to the first-run copy. */
  subheading?: string;
  /** If false (default), the card renders nothing once all 4 steps are done —
   *  used on the dashboard, where a one-time "you're all set" banner takes over.
   *  Set true to keep it visible indefinitely, e.g. so it can be revisited from
   *  Account Settings. */
  showWhenComplete?: boolean;
  /** Reports loading/completion state up to the parent (e.g. so the dashboard
   *  knows when to show its "you're all set" banner). */
  onStatusChange?: (status: { loading: boolean; complete: boolean }) => void;
  /** If true, only the heading + progress count show by default; clicking it
   *  expands/collapses the full step list. Collapsed by default. */
  collapsible?: boolean;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  heading = "Welcome to Talos — let's get you set up",
  subheading = 'Four steps to start receiving and ranking HVAC applicants.',
  showWhenComplete = false,
  onStatusChange,
  collapsible = false,
}) => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeJobs, setActiveJobs] = useState<JobLite[]>([]);
  const [applicantTotal, setApplicantTotal] = useState(0);
  const [profileComplete, setProfileComplete] = useState(false);
  const [deliverabilityConfirmedAt, setDeliverabilityConfirmedAt] = useState<string | null>(null);
  const [shareLinkConfirmedAt, setShareLinkConfirmedAt] = useState<string | null>(null);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [confirmingDeliverability, setConfirmingDeliverability] = useState(false);

  useEffect(() => {
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    const base = appConfig.apiUrl;
    Promise.all([
      fetch(`${base}/api/jobs`, { headers }),
      fetch(`${base}/api/pipeline/talent-pool/stats`, { headers }),
      fetch(`${base}/api/auth/me`, { headers }),
    ]).then(async (responses) => {
      const [jobsRes, statsRes, meRes] = await Promise.all(responses.map(r => r.json()));
      if (jobsRes.status === 'success') {
        setActiveJobs((jobsRes.data.jobs ?? []).filter((j: JobLite) => j.status !== 'deleted'));
      }
      if (statsRes.status === 'success') setApplicantTotal(statsRes.data?.total ?? 0);
      if (meRes.status === 'success') {
        const { companyName, logoUrl, serviceArea, deliverabilityConfirmedAt, shareLinkConfirmedAt } = meRes.data;
        setProfileComplete(!!(companyName && logoUrl && serviceArea));
        setDeliverabilityConfirmedAt(deliverabilityConfirmedAt || null);
        setShareLinkConfirmedAt(shareLinkConfirmedAt || null);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/auth/send-test-email`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 'success') setTestEmailSent(true);
    } catch {} finally {
      setSendingTestEmail(false);
    }
  };

  const confirmDeliverability = async () => {
    setConfirmingDeliverability(true);
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/auth/confirm-deliverability`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 'success') setDeliverabilityConfirmedAt(data.data.deliverabilityConfirmedAt);
    } catch {} finally {
      setConfirmingDeliverability(false);
    }
  };

  const step1Complete = profileComplete;
  const step2Complete = !!deliverabilityConfirmedAt;
  const step3Complete = activeJobs.length > 0;
  const step4Complete = !!shareLinkConfirmedAt;
  const complete = step1Complete && step2Complete && step3Complete && step4Complete;

  useEffect(() => {
    onStatusChange?.({ loading, complete });
    // onStatusChange intentionally omitted — it's a fresh closure every parent
    // render, but only ever calls stable setState setters, so re-running this
    // effect on every parent render would be wasted work, not a correctness fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, complete]);

  if (loading || (complete && !showWhenComplete)) return null;

  const doneCount = [step1Complete, step2Complete, step3Complete, step4Complete].filter(Boolean).length;
  const showBody = !collapsible || expanded;

  return (
    <GetStartedCard>
      {collapsible ? (
        <HeaderRow type="button" onClick={() => setExpanded(e => !e)} style={{ marginBottom: showBody ? '0.35rem' : 0 }}>
          <HeaderTitle>
            {heading}
            <StepCount>{doneCount}/4 complete</StepCount>
          </HeaderTitle>
          <Chevron size={18} $expanded={expanded} />
        </HeaderRow>
      ) : (
        <GetStartedHeading>{heading}</GetStartedHeading>
      )}
      {showBody && <GetStartedSub>{subheading}</GetStartedSub>}
      {showBody && (
      <StepList>
        <StepRow state={profileComplete ? 'done' : 'active'}>
          <StepIcon state={profileComplete ? 'done' : 'active'}>{profileComplete ? '✓' : 1}</StepIcon>
          <StepText>
            <StepTitle state={profileComplete ? 'done' : 'active'}>Complete your company profile</StepTitle>
            <StepDesc>
              {profileComplete
                ? 'Your company name, logo, and service area are all set.'
                : "Add your company name, logo, and service area — candidates see these on your public application link before they'll trust it enough to upload a resume."}
            </StepDesc>
          </StepText>
          {!profileComplete && (
            <StepBtn onClick={() => navigate('/account')}>Complete Profile →</StepBtn>
          )}
        </StepRow>

        <StepRow state={step2Complete ? 'done' : 'active'}>
          <StepIcon state={step2Complete ? 'done' : 'active'}>{step2Complete ? '✓' : 2}</StepIcon>
          <StepText>
            <StepTitle state={step2Complete ? 'done' : 'active'}>Confirm you're getting applicant alerts</StepTitle>
            <StepDesc>
              {step2Complete ? (
                'Confirmed — applicant alerts will reach your inbox.'
              ) : testEmailSent ? (
                <>Check your inbox — and your Spam/Junk folder — for an email from <strong>jake@gotalos.io</strong>. On Outlook or Microsoft 365, add it to your safe senders list (Settings → Mail → Junk email → Safe senders and domains) so it doesn't happen again.</>
              ) : (
                "Talos emails land in spam more often than they should, especially on Outlook and Microsoft 365. Send yourself a real alert now so you don't miss a great applicant later."
              )}
            </StepDesc>
          </StepText>
          {!step2Complete && (
            testEmailSent ? (
              <StepBtn onClick={confirmDeliverability}>{confirmingDeliverability ? 'Confirming…' : 'I got it →'}</StepBtn>
            ) : (
              <StepBtn onClick={sendTestEmail}>{sendingTestEmail ? 'Sending…' : 'Send Test Email →'}</StepBtn>
            )
          )}
        </StepRow>

        <StepRow state={step3Complete ? 'done' : 'active'}>
          <StepIcon state={step3Complete ? 'done' : 'active'}>{step3Complete ? '✓' : 3}</StepIcon>
          <StepText>
            <StepTitle state={step3Complete ? 'done' : 'active'}>Create your first job posting</StepTitle>
            <StepDesc>
              {step3Complete
                ? 'Job posted — Talos generated your public application link.'
                : 'Set up a position — Talos generates a public application link automatically.'}
            </StepDesc>
          </StepText>
          <StepBtn onClick={() => navigate('/jobs-management?new=true')}>
            {step3Complete ? 'Create Another →' : 'Create Job →'}
          </StepBtn>
        </StepRow>

        <StepRow state={!step3Complete ? 'locked' : step4Complete ? 'done' : 'active'}>
          <StepIcon state={!step3Complete ? 'locked' : step4Complete ? 'done' : 'active'}>
            {step4Complete ? '✓' : 4}
          </StepIcon>
          <StepText>
            <StepTitle state={!step3Complete ? 'locked' : step4Complete ? 'done' : 'active'}>
              Access your shareable link
            </StepTitle>
            {!step3Complete ? (
              <StepDesc>Create a job first — your shareable link, a QR code, and one-click share buttons will appear at the top of the job detail panel.</StepDesc>
            ) : step4Complete ? (
              <StepDesc>
                {applicantTotal ? `${applicantTotal} applicant${applicantTotal === 1 ? '' : 's'} in your pipeline so far. ` : ''}Your link, QR code, and share buttons are always available from the job detail panel.
              </StepDesc>
            ) : (
              <>
                <StepDesc>Your link, QR code, and share buttons are ready at the top of the job detail panel. Where HVAC owners actually get applicants from it:</StepDesc>
                <StepHintList>
                  <StepHintPill>Facebook trade groups</StepHintPill>
                  <StepHintPill>Your website's careers page</StepHintPill>
                  <StepHintPill>QR code on truck wraps</StepHintPill>
                  <StepHintPill>Text referrals directly</StepHintPill>
                  <StepHintPill>Johnstone / Ferguson counters</StepHintPill>
                  <StepHintPill>Trade school placement offices</StepHintPill>
                </StepHintList>
              </>
            )}
          </StepText>
          {step3Complete && (
            <StepBtn onClick={() => navigate(`/jobs-management/${activeJobs[0].id}#share-link`)}>
              {applicantTotal > 0 ? 'Review Applicants →' : 'Go to Job →'}
            </StepBtn>
          )}
        </StepRow>
      </StepList>
      )}
    </GetStartedCard>
  );
};

export default OnboardingChecklist;
