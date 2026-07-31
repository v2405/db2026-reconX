// TICKET-ADV115 — useWebSocket(url) with auto-reconnect (exp backoff up to 5 tries).

import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(
  url,
  { reconnect = true, maxRetries = 5 } = {}
) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('connecting');

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retriesRef = useRef(0);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!url || unmountedRef.current) {
      return;
    }

    setStatus('connecting');

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      retriesRef.current = 0;
      setStatus('open');
    };

    socket.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data));
      } catch {
        setData(event.data);
      }
    };

    socket.onerror = () => {
      setStatus('error');
    };

    socket.onclose = () => {
      setStatus('closed');

      if (
        reconnect &&
        !unmountedRef.current &&
        retriesRef.current < maxRetries
      ) {
        const delay = Math.min(
          500 * Math.pow(2, retriesRef.current),
          30000
        );

        retriesRef.current += 1;

        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };
  }, [url, reconnect, maxRetries]);

  useEffect(() => {
    unmountedRef.current = false;

    connect();

    return () => {
      unmountedRef.current = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((payload) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    if (typeof payload === 'string') {
      socket.send(payload);
    } else {
      socket.send(JSON.stringify(payload));
    }
  }, []);

  return {
    data,
    status,
    send,
  };
}

export default useWebSocket;
