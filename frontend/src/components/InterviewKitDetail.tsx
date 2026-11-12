import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, AlertTriangle, ShieldAlert, BookOpen, ListPlus } from 'lucide-react';
import { fetchKit, KIT_TYPE_LABELS, STATUS_LABELS } from '../interviewKits/api';
import { InterviewKit } from '../interviewKits/types';
import {
  FontImport, Page, TopBar, TopBarTitle, Inner, GhostButton, PrimaryButton, Badge, Card, CardHeader,
  CardTitle, CardBody, Mono, CenterMsg,
} from '../interviewKits/styles';

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0.6rem 0 0.4rem;
  line-height: 1.25;

  @media (max-width: 768px) { font-size: 1.2rem; }
`;

const Meta = styled.p`
  font-size: 0.8rem;
  color: #8a9ab0;
  margin: 0;
  line-height: 1.6;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const DraftBanner = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  border: 1px solid rgba(251,191,36,0.35);
  background: rgba(251,191,36,0.06);
  color: #fcd34d;
  font-size: 0.8rem;
  line-height: 1.55;
  padding: 0.8rem 1rem;
  margin-bottom: 1.25rem;

  svg { flex-shrink: 0; margin-top: 0.1rem; }
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  li { font-size: 0.85rem; line-height: 1.6; color: #c8d0dc; }
`;

const SectionDesc = styled.p`
  font-size: 0.82rem;
  line-height: 1.6;
  color: #8a9ab0;
  margin: 0 0 1rem;
`;

const ScaleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  color: #8a9ab0;

  b { color: #ffffff; font-family: 'JetBrains Mono', monospace; }
`;

const QuestionBlock = styled.div`
  border-top: 1px solid #1e2330;
  padding: 1rem 0;

  &:first-of-type { border-top: none; padding-top: 0.25rem; }
  &:last-of-type { padding-bottom: 0; }
`;

const QuestionHead = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
`;

const QNum = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4ade80;
  min-width: 1.5rem;
  padding-top: 0.1rem;
`;

const QPrompt = styled.p`
  font-size: 0.92rem;
  line-height: 1.55;
  color: #ffffff;
  margin: 0;
  flex: 1;
`;

const Detail = styled.div`
  margin: 0.6rem 0 0 2.25rem;

  @media (max-width: 480px) { margin-left: 0; }
`;

const DetailLabel = styled.div<{ $tone?: 'flag' }>`
  font-size: 0.64rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${p => (p.$tone === 'flag' ? '#f87171' : '#6e7d8e')};
  margin-bottom: 0.2rem;
`;

const DetailText = styled.p`
  font-size: 0.82rem;
  line-height: 1.6;
  color: #c8d0dc;
  margin: 0;
  white-space: pre-wrap;
`;

const SectionNotes = styled.div`
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #1e2330;
`;

const SourceDetails = styled.details`
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #1e2330;

  summary {
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #8a9ab0;
    margin-bottom: 0.6rem;
  }
  li { font-size: 0.78rem !important; color: #8a9ab0 !important; }
`;

const InterviewKitDetail: React.FC = () => {
  const { kitId } = useParams<{ kitId: string }>();
  const navigate = useNavigate();
  const [kit, setKit] = useState<InterviewKit | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    if (!kitId) { setState('missing'); return; }
    let cancelled = false;
    fetchKit(kitId)
      .then(k => {
        if (cancelled) return;
        setKit(k);
        setState(k ? 'ready' : 'missing');
      })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [kitId]);

  return (
    <>
      <FontImport />
      <Page>
        <TopBar>
          <GhostButton onClick={() => navigate('/interview-kits')}>
            <ArrowLeft size={13} /> Interview Kits
          </GhostButton>
          <TopBarTitle>{kit?.title ?? 'Interview Kit'}</TopBarTitle>
          {kit && (
            <PrimaryButton style={{ marginLeft: 'auto' }} onClick={() => navigate(`/interview-kits/sets/new?kit=${encodeURIComponent(kit.id)}`)}>
              <ListPlus size={14} /> Build a set from this kit
            </PrimaryButton>
          )}
        </TopBar>

        <Inner $narrow>
          {state === 'loading' && <CenterMsg>Loading kit...</CenterMsg>}
          {state === 'missing' && <CenterMsg>This interview kit could not be found.</CenterMsg>}
          {state === 'error' && <CenterMsg>Could not load this kit. Try again in a moment.</CenterMsg>}

          {state === 'ready' && kit && (
            <>
              <Header>
                <BadgeRow>
                  <Badge $tone={kit.status === 'reviewed' ? 'reviewed' : 'draft'}>{STATUS_LABELS[kit.status] ?? kit.status}</Badge>
                  <Badge>{KIT_TYPE_LABELS[kit.type] ?? kit.type}</Badge>
                  <Badge>v{kit.version}{kit.versionDate ? ` · ${kit.versionDate}` : ''}</Badge>
                </BadgeRow>
                <Title>{kit.title}</Title>
                <Meta>
                  {kit.roles.join(', ')}
                  {kit.levels.length > 0 && <> · {kit.levels.join(', ')}</>}
                </Meta>
                {kit.summary && <Meta style={{ marginTop: '0.5rem' }}>{kit.summary}</Meta>}
              </Header>

              {kit.status === 'draft_under_review' && (
                <DraftBanner>
                  <AlertTriangle size={15} />
                  <span>
                    Draft, under review. Answer keys haven't been fully checked by working techs yet.
                    Use this kit as a guide, and have a person make every hiring decision.
                  </span>
                </DraftBanner>
              )}

              {kit.howToUse && kit.howToUse.length > 0 && (
                <Card>
                  <CardHeader>
                    <BookOpen size={13} color="#8a9ab0" />
                    <CardTitle>How to use this kit</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <List>{kit.howToUse.map((t, i) => <li key={i}>{t}</li>)}</List>
                  </CardBody>
                </Card>
              )}

              {kit.guardrails && kit.guardrails.length > 0 && (
                <Card>
                  <CardHeader>
                    <ShieldAlert size={13} color="#f87171" />
                    <CardTitle>Guardrails</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <List>{kit.guardrails.map((t, i) => <li key={i}>{t}</li>)}</List>
                  </CardBody>
                </Card>
              )}

              {kit.sections.map(section => (
                <Card key={section.key}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <Mono style={{ marginLeft: 'auto' }}>
                      {section.questions.length} {section.questions.length === 1 ? 'question' : 'questions'}
                      {!section.scoreOptions && ' · not scored'}
                    </Mono>
                  </CardHeader>
                  <CardBody>
                    {section.description && <SectionDesc>{section.description}</SectionDesc>}
                    {section.scoreOptions && (
                      <ScaleRow>
                        {section.scoreOptions.map(o => (
                          <span key={o.value}><b>{o.label}</b>{o.description ? ` ${o.description}` : ''}</span>
                        ))}
                      </ScaleRow>
                    )}
                    {section.questions.map(question => (
                      <QuestionBlock key={question.key}>
                        <QuestionHead>
                          <QNum>{question.number}</QNum>
                          <QPrompt>{question.prompt}</QPrompt>
                        </QuestionHead>
                        {question.answerKey && (
                          <Detail>
                            <DetailLabel>Answer key</DetailLabel>
                            <DetailText>{question.answerKey}</DetailText>
                          </Detail>
                        )}
                        {question.details?.map((d, i) => (
                          <Detail key={i}>
                            <DetailLabel>{d.label}</DetailLabel>
                            <DetailText>{d.text}</DetailText>
                          </Detail>
                        ))}
                        {question.redFlags && (
                          <Detail>
                            <DetailLabel $tone="flag">Red flags</DetailLabel>
                            <DetailText>{question.redFlags}</DetailText>
                          </Detail>
                        )}
                        {question.guidance && (
                          <Detail>
                            <DetailLabel>Interviewer note</DetailLabel>
                            <DetailText>{question.guidance}</DetailText>
                          </Detail>
                        )}
                      </QuestionBlock>
                    ))}
                    {section.notes && section.notes.length > 0 && (
                      <SectionNotes>
                        <DetailLabel>Notes</DetailLabel>
                        <List>{section.notes.map((t, i) => <li key={i}>{t}</li>)}</List>
                      </SectionNotes>
                    )}
                    {section.sourceNotes && section.sourceNotes.length > 0 && (
                      <SourceDetails>
                        <summary>How these answer keys were checked ({section.sourceNotes.length})</summary>
                        <List>{section.sourceNotes.map((t, i) => <li key={i}>{t}</li>)}</List>
                      </SourceDetails>
                    )}
                  </CardBody>
                </Card>
              ))}

              {kit.extraSections?.map((extra, i) => (
                <Card key={`extra-${i}`}>
                  <CardHeader><CardTitle>{extra.title}</CardTitle></CardHeader>
                  <CardBody><List>{extra.lines.map((t, j) => <li key={j}>{t}</li>)}</List></CardBody>
                </Card>
              ))}

              <Meta>
                To run this kit, open a candidate's profile and choose Start interview. To ask only some
                of these questions, use Build a set from this kit.
              </Meta>
            </>
          )}
        </Inner>
      </Page>
    </>
  );
};

export default InterviewKitDetail;
