// TICKET-ADV120 — useMemo for portfolio-value calc.
// TICKET-ADV116 — useTradeStream live feed.
import React, { useMemo } from 'react';
import { withAuth } from '@components/withAuth.jsx';
import { useTradeStream } from '@hooks/useTradeStream.js';

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <h3>{label}</h3>
      <p>{value}</p>
    </article>
  );
}
function Dashboard() {
  const { trades, isConnected } = useTradeStream();
  // Total portfolio value
  const portfolioValue = useMemo(() => {
    return trades.reduce((total, trade) => {
      const quantity = Number(trade.quantity) || 0;
      const price = Number(trade.price) || 0;
      return total + quantity * price;
    }, 0);
  }, [trades]);
  // Number of matched trades
  const matched = useMemo(() => {
    return trades.filter(
      (trade) => trade.status === 'MATCHED'
    ).length;
  }, [trades]);
  const breaks = useMemo(() => {
    return trades.filter((trade) =>
      ['UNMATCHED', 'DISPUTED'].includes(trade.status)
    ).length;
  }, [trades]);

  return (
    <section>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        <StatCard
          label="Portfolio Value"
          value={portfolioValue.toLocaleString()}
        />
        <StatCard
          label="Trades Streamed"
          value={trades.length}
        />
        <StatCard
          label="Matched"
          value={matched}
        />
        <StatCard
          label="Open Breaks"
          value={breaks}
        />
      </div>

      <div role="status" aria-live="polite">
        SSE: {isConnected ? 'connected' : 'disconnected'}
      </div>
    </section>
  );
}

export default withAuth(Dashboard);
