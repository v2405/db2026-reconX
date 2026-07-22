-- ============================================================================
-- TICKET-ADV010 — VWAP per instrument per day (window function)
-- ============================================================================
SELECT
    t.id,
    t.trade_ref,
    t.instrument_id,
    t.trade_date,
    t.quantity,
    t.price,
    (t.price * t.quantity) AS notional,

    SUM(t.price * t.quantity)
        OVER (
            PARTITION BY t.instrument_id, t.trade_date
        )
    /
    NULLIF(
        SUM(t.quantity)
            OVER (
                PARTITION BY t.instrument_id, t.trade_date
            ),
        0
    ) AS vwap

FROM trades t

WHERE t.deleted_at IS NULL

ORDER BY
    t.trade_date,
    t.instrument_id,
    t.id;


-- ============================================================================
-- TICKET-ADV011 — Recursive CTE: trade lifecycle (execution -> settlement
--                -> recon_break -> resolution)
-- ============================================================================
WITH RECURSIVE trade_lifecycle AS (
    -- anchor: every trade in its execution state
    SELECT
        t.id           AS trade_id,
        t.trade_ref,
        1              AS step,
        'EXECUTED'     AS state,
        t.created_at   AS at_ts,
        NULL::text     AS detail
    FROM trades t
    WHERE t.deleted_at IS NULL

    UNION ALL

    -- recursive: each subsequent state derived from the previous step
    SELECT
        tl.trade_id,
        tl.trade_ref,
        tl.step + 1,
        CASE tl.step
            WHEN 1 THEN 'CONFIRMED'
            WHEN 2 THEN 'SETTLED'
            WHEN 3 THEN 'RECON_BREAK'
            WHEN 4 THEN 'RESOLVED'
    
        END,
        CASE tl.step

            WHEN 1 THEN 'CONFIRMED'

            WHEN 2 THEN s.status

            WHEN 3 THEN rb.status

            WHEN 4 THEN 'RESOLVED'
        END
    
 FROM trade_lifecycle tl

    JOIN trades t
      ON t.id = tl.trade_id

    LEFT JOIN settlements s
      ON s.trade_id = tl.trade_id

    LEFT JOIN recon_breaks rb
      ON rb.trade_id = tl.trade_id

    WHERE tl.step < 5

)
SELECT * FROM trade_lifecycle
ORDER BY trade_id, step;


-- ============================================================================
-- ADV008 — REFRESH the daily-summary materialised view (concurrent so it can
--         run while the dashboard is reading it)
-- ============================================================================
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_recon_summary;

SELECT
    trade_date,
    region,
    asset_class,
    total_trades,
    matched_trades,
    open_breaks,
    gross_notional,
    match_rate_pct
FROM mv_daily_recon_summary
ORDER BY trade_date DESC;


-- ============================================================================
-- ADV009 — JSONB lookup: which instruments have sector = 'Banking'?
-- ============================================================================
EXPLAIN ANALYZE

SELECT
    id,
    symbol,
    metadata

FROM instruments

WHERE metadata @> '{"sector":"Banking"}';
