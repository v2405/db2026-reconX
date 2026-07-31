// TICKET-ADV116 — useTradeStream() — SSE subscription returning live trades.
import { useEffect, useState } from 'react';
export function useTradeStream(url = '/api/v1/trades/stream') {
  const [trades, setTrades] = useState([]);
  const [isConnected, setConnected] = useState(false);
  useEffect(() => {
    const eventSource = new EventSource(url);
    eventSource.onopen = () => {
      setConnected(true);
    };
    eventSource.onmessage = (event) => {
      try {
        const trade = JSON.parse(event.data);
        setTrades((previous) =>
          [trade, ...previous].slice(0, 200)
        );
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };
    eventSource.onerror = () => {
      setConnected(false);
    };
    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, [url]);
  return {
    trades,
    isConnected,
  };
}
export default useTradeStream;
