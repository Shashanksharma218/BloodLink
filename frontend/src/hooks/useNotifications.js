import { useEffect, useRef, useState, useCallback } from 'react';
import API_BASE_URL from '../config/api';
import { fetchNotifications } from '../api';

export function useNotifications({ enabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const lastTsRef = useRef(localStorage.getItem('notif_since') || '');
  const esRef = useRef(null);
  const pollTimerRef = useRef(null);

  const computeUnread = useCallback((list) => list.filter((n) => !n.read).length, []);

  const append = useCallback((incoming) => {
    if (!incoming || incoming.length === 0) return;
    setNotifications((prev) => {
      // Merge by id and prefer incoming entries
      const byId = new Map(prev.map(n => [n.id || `${n.createdAt}-${Math.random()}`, n]));
      for (const n of incoming) {
        const key = n.id || `${n.createdAt}-${Math.random()}`;
        const existing = byId.get(key) || {};
        byId.set(key, { ...existing, ...n });
      }
      const merged = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUnread(computeUnread(merged));
      // Advance since cursor to the newest item we just received
      const latestIncoming = incoming.reduce((m, n) => (new Date(n.createdAt) > new Date(m || 0) ? n.createdAt : m), lastTsRef.current);
      if (latestIncoming) {
        lastTsRef.current = latestIncoming;
        localStorage.setItem('notif_since', latestIncoming);
      }
      return merged;
    });
  }, [computeUnread]);

  const stop = useCallback(() => {
    if (esRef.current) esRef.current.close();
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
  }, []);

  const startSSE = useCallback(() => {
    try {
      const es = new EventSource(`${API_BASE_URL}/api/notifications/stream`, { withCredentials: true });
      esRef.current = es;
      es.onopen = () => setConnected(true);
      es.onerror = () => setConnected(false);
      es.addEventListener('notification', (evt) => {
        try {
          const data = JSON.parse(evt.data);
          append([data]);
        } catch (_) {}
      });
    } catch (_) {
      setConnected(false);
    }
  }, [append]);

  const startPoll = useCallback(() => {
    let consecutive404s = 0;
    const tick = async () => {
      try {
        const data = await fetchNotifications({ since: lastTsRef.current });
        append(data.notifications || []);
        consecutive404s = 0;
      } catch (e) {
        if (e.status === 404) {
          consecutive404s++;
          if (consecutive404s >= 2) {
            setDisabled(true);
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
            return;
          }
        } else {
          console.warn('Notification polling error', e);
        }
      }
      pollTimerRef.current = setTimeout(tick, 10000);
    };
    tick();
  }, [append]);

  const startStream = useCallback(() => {
    if (!enabled || disabled) return;
    stop();
    startSSE();
    // Fallback to polling if SSE fails to connect within 3s
    setTimeout(() => {
      if (!connected && !disabled) {
        stop();
        startPoll();
      }
    }, 3000);
  }, [enabled, disabled, startSSE, startPoll, stop, connected]);

  const markRead = useCallback(async (ids = []) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids })
      });
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - ids.length));
    } catch (_) {}
  }, []);

  const getUnreadCount = useCallback(() => unread, [unread]);

  useEffect(() => {
    startStream();
    return () => stop();
  }, [startStream, stop]);

  return { notifications, unread, getUnreadCount, startStream, markRead };
}


