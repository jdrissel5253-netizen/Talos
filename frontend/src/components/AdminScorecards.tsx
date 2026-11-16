import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Upload } from 'lucide-react';
import { AdminScorecardStatus, ApiError, fetchAdminScorecards, uploadScorecardBundle } from '../rideAlong/api';

// Platform-admin tool: upload the ride-along scorecard bundle (.json with
// shared tasks and scorecards). The server validates it, adds a new version
// only for tasks and scorecards that changed, and never duplicates a task.
// Scorecard content is never committed to the repo, because the repo is public.

const Wrap = styled.div`
  background: #161a22;
  border: 1px solid #232830;
  margin-bottom: 2.5rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 1.25rem;
  border-top: 1px solid #1e2330;
  &:first-child { border-top: none; }
`;

const Name = styled.div`
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
`;

const Meta = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #6e7d8e;
  margin-top: 0.2rem;
`;

const UploadBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid #2a3040;
  color: #c8d0dc;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
  &:hover:not(:disabled) { border-color: #4ade80; color: #4ade80; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Message = styled.div<{ $error?: boolean }>`
  grid-column: 1 / -1;
  font-size: 0.78rem;
  line-height: 1.55;
  color: ${p => (p.$error ? '#f87171' : '#4ade80')};
  ul { margin: 0.35rem 0 0; padding-left: 1.1rem; max-height: 240px; overflow-y: auto; }
`;

const Note = styled.p`
  font-size: 0.78rem;
  color: #6e7d8e;
  line-height: 1.6;
  margin: -0.5rem 0 1rem;
`;

const AdminScorecards: React.FC = () => {
  const [status, setStatus] = useState<AdminScorecardStatus | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string; details?: string[] } | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  const load = useCallback(() => {
    fetchAdminScorecards().then(setStatus).catch(() => setLoadError(true));
  }, []);
  useEffect(load, [load]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setFeedback({ error: false, text: `Checking ${file.name}...` });
    try {
      const r = await uploadScorecardBundle(file);
      const cards = r.scorecards.map(s => `${s.slug} ${s.created ? `→ v${s.version}` : `unchanged (v${s.version})`}`).join('; ');
      setFeedback({
        error: false,
        text: `Tasks: ${r.tasks.created} new, ${r.tasks.updated} changed, ${r.tasks.unchanged} unchanged.${cards ? ` Scorecards: ${cards}.` : ''}`,
      });
      load();
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      setFeedback({ error: true, text: e?.message || 'Upload failed.', details: e?.details });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  if (loadError) return <Note>Scorecard uploads aren't available yet (the backend hasn't been deployed).</Note>;
  if (!status) return <Note>Loading scorecards...</Note>;

  return (
    <>
      <Note>
        Upload one .json file with the shared tasks and scorecards. Only tasks and scorecards that changed get a new
        version, and ride-alongs already scored keep the version they used. {status.sharedTaskCount} shared tasks in the library.
      </Note>
      <Wrap>
        {status.scorecards.length === 0 && <Row><Meta>No scorecards uploaded yet.</Meta></Row>}
        {status.scorecards.map(s => (
          <Row key={s.slug}>
            <div>
              <Name>{s.title}</Name>
              <Meta>
                {s.role} · {s.taskCount} tasks · v{s.latestVersion}
                {s.lastUploadedAt ? ` · uploaded ${new Date(s.lastUploadedAt).toLocaleDateString()}` : ''}
              </Meta>
            </div>
          </Row>
        ))}
        <Row>
          <Meta>Upload a new or updated bundle</Meta>
          <div>
            <input type="file" accept=".json,application/json" hidden ref={input} onChange={e => onFile(e.target.files?.[0])} />
            <UploadBtn disabled={busy} onClick={() => input.current?.click()}>
              <Upload size={12} /> {busy ? 'Uploading...' : 'Upload .json'}
            </UploadBtn>
          </div>
          {feedback && (
            <Message $error={feedback.error}>
              {feedback.text}
              {feedback.details && feedback.details.length > 0 && <ul>{feedback.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
            </Message>
          )}
        </Row>
      </Wrap>
    </>
  );
};

export default AdminScorecards;
