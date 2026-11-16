import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, patchEvaluation } from './api';
import { Evaluation, EvaluationPatch } from './types';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'invalid';

const SAVE_DELAY_MS = 350;   // quick enough that every tap is saved within a moment
const RETRY_DELAY_MS = 4000; // signal drops in a truck or basement: keep retrying

/**
 * Autosave queue for one evaluation. Each change has a slot key (e.g.
 * "step:T2.3"); a newer change to the same slot replaces the queued one, and
 * slots are sent one PATCH at a time, in order. Failed sends are retried
 * until they go through; whatever is left is sent when the page is hidden.
 */
export function useEvaluationAutosave(
  evaluationId: number,
  { onSaved, onLocked }: { onSaved: (e: Evaluation) => void; onLocked: () => void },
) {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const queue = useRef(new Map<string, EvaluationPatch>());
  const flushing = useRef<Promise<void> | null>(null);
  const timer = useRef<number | null>(null);
  const callbacks = useRef({ onSaved, onLocked });
  callbacks.current = { onSaved, onLocked };

  const flush = useCallback((): Promise<void> => {
    if (flushing.current) return flushing.current;
    if (!queue.current.size) return Promise.resolve();
    const run = (async () => {
      setStatus('saving');
      let invalid = false;
      try {
        while (queue.current.size) {
          const [slot, patch] = queue.current.entries().next().value as [string, EvaluationPatch];
          try {
            const updated = await patchEvaluation(evaluationId, patch);
            callbacks.current.onSaved(updated);
          } catch (err) {
            if (err instanceof ApiError && err.status === 400) {
              invalid = true; // the server rejected this change; don't retry it forever
            } else {
              throw err;
            }
          }
          // Only clear the slot if it wasn't changed again while sending.
          if (queue.current.get(slot) === patch) queue.current.delete(slot);
        }
        setStatus(invalid ? 'invalid' : 'saved');
      } catch (err) {
        if (err instanceof ApiError && (err.status === 409 || err.status === 404)) {
          // Submitted or discarded elsewhere (another phone or a teammate).
          queue.current.clear();
          setStatus('saved');
          callbacks.current.onLocked();
          return;
        }
        setStatus('error');
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => { void flush(); }, RETRY_DELAY_MS);
      }
    })().finally(() => { flushing.current = null; });
    flushing.current = run;
    return run;
  }, [evaluationId]);

  const save = useCallback((slot: string, patch: EvaluationPatch, { immediate = false } = {}) => {
    queue.current.set(slot, patch);
    if (timer.current) window.clearTimeout(timer.current);
    if (immediate) { void flush(); return; }
    timer.current = window.setTimeout(() => { void flush(); }, SAVE_DELAY_MS);
  }, [flush]);

  /** Sends everything now; resolves once the queue is empty or a send failed. */
  const flushNow = useCallback(async (): Promise<boolean> => {
    if (timer.current) window.clearTimeout(timer.current);
    await flush();
    // A flush already running may have finished before newer changes arrived.
    if (queue.current.size) await flush();
    return queue.current.size === 0;
  }, [flush]);

  const clear = useCallback(() => {
    queue.current.clear();
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  // Phone locked, app switched or tab closed: send what's left, best effort.
  useEffect(() => {
    const sendRemaining = () => {
      queue.current.forEach(patch => { void patchEvaluation(evaluationId, patch, { keepalive: true }).catch(() => {}); });
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') void flush(); };
    const warn = (e: BeforeUnloadEvent) => {
      if (queue.current.size) { e.preventDefault(); e.returnValue = ''; }
    };
    const onOnline = () => { void flush(); };
    window.addEventListener('pagehide', sendRemaining);
    window.addEventListener('beforeunload', warn);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', sendRemaining);
      window.removeEventListener('beforeunload', warn);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisibility);
      if (timer.current) window.clearTimeout(timer.current);
      sendRemaining();
    };
  }, [evaluationId, flush]);

  return { status, save, flushNow, clear, pending: () => queue.current.size > 0 };
}
