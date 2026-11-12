import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Upload } from 'lucide-react';
import { AdminKitStatus, ApiError, fetchAdminKits, uploadKitDocx } from '../interviewKits/api';

// Platform-admin tool: upload the source .docx for each shared interview kit.
// The server checks the document against the kit's expected structure, then
// stores it as a new version (Draft - Under review). Kit content is never
// committed to the repo, because the repo is public.

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

  ul { margin: 0.35rem 0 0; padding-left: 1.1rem; }
`;

const Note = styled.p`
  font-size: 0.78rem;
  color: #6e7d8e;
  line-height: 1.6;
  margin: -0.5rem 0 1rem;
`;

interface Feedback { error: boolean; text: string; details?: string[] }

const AdminInterviewKits: React.FC = () => {
  const [kits, setKits] = useState<AdminKitStatus[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(() => {
    fetchAdminKits().then(setKits).catch(() => setLoadError(true));
  }, []);
  useEffect(load, [load]);

  const onFile = async (slug: string, file: File | undefined) => {
    if (!file) return;
    setBusy(slug);
    setFeedback(f => ({ ...f, [slug]: { error: false, text: `Checking ${file.name}...` } }));
    try {
      const r = await uploadKitDocx(slug, file);
      setFeedback(f => ({ ...f, [slug]: { error: false, text: `${r.message} ${r.questionCount} questions.` } }));
      load();
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      setFeedback(f => ({ ...f, [slug]: { error: true, text: e?.message || 'Upload failed.', details: e?.details } }));
    } finally {
      setBusy(null);
      const input = inputs.current[slug];
      if (input) input.value = '';
    }
  };

  if (loadError) return <Note>Interview kit uploads aren't available yet (the backend hasn't been deployed).</Note>;
  if (!kits) return <Note>Loading interview kits...</Note>;

  return (
    <>
      <Note>
        Upload each kit's .docx. It's checked against the kit's expected structure and saved as a new
        version marked Draft - Under review. Uploading an unchanged file does nothing. Interviews already
        run keep the version they used.
      </Note>
      <Wrap>
        {kits.map(k => {
          const fb = feedback[k.slug];
          return (
            <Row key={k.slug}>
              <div>
                <Name>{k.title}</Name>
                <Meta>
                  {k.latestVersion
                    ? `v${k.latestVersion} · uploaded ${new Date(k.lastUploadedAt as string).toLocaleDateString()}`
                    : 'No content uploaded yet'}
                </Meta>
              </div>
              <div>
                <input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  hidden
                  ref={el => { inputs.current[k.slug] = el; }}
                  onChange={e => onFile(k.slug, e.target.files?.[0])}
                />
                <UploadBtn disabled={busy !== null} onClick={() => inputs.current[k.slug]?.click()}>
                  <Upload size={12} /> {busy === k.slug ? 'Uploading...' : 'Upload .docx'}
                </UploadBtn>
              </div>
              {fb && (
                <Message $error={fb.error}>
                  {fb.text}
                  {fb.details && fb.details.length > 0 && <ul>{fb.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
                </Message>
              )}
            </Row>
          );
        })}
      </Wrap>
    </>
  );
};

export default AdminInterviewKits;
