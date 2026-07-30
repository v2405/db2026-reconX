// ============================================================================
// TICKET-ADV106 — Server-Sent Events (SSE) Live Trade Feed
// TICKET-ADV107 — Prepend new trades with slide-in animation
//
// Static implementation using demo events.
// Replace the demo event generator with:
//
// const eventSource = new EventSource("/api/v1/trades/stream");
//
// in a real backend.
// ============================================================================

(function () {
    "use strict";

    const feed = document.getElementById("trade-feed");

    if (!feed) {
        return;
    }

    /**
     * Creates a trade card.
     * @param {Object} trade
     * @returns {HTMLElement}
     */
    function createTradeCard(trade) {

        const article = document.createElement("article");

        article.className =
            `trade-card trade-card--${trade.status.toLowerCase()}`;

        article.innerHTML = `
            <strong>${trade.tradeRef}</strong>
            <span>${trade.symbol}</span>
            <span>Qty: ${Number(trade.qty).toLocaleString()}</span>
            <span>Price: ${trade.price}</span>
            <span>Status: ${trade.status}</span>
        `;

        return article;
    }

    /**
     * Prepends a trade card to the feed.
     * Latest trades always appear first.
     *
     * @param {Object} trade
     */
    function prependTrade(trade) {

        const card = createTradeCard(trade);

        feed.prepend(card);

        // Keep only the newest 25 cards.

        while (feed.children.length > 25) {
            feed.removeChild(feed.lastElementChild);
        }
    }

    // ------------------------------------------------------------------------
    // Demo trades
    // ------------------------------------------------------------------------

    const demoTrades = [

        {
            tradeRef: "EQU-20260730-0001",
            symbol: "SAP.DE",
            qty: 1000,
            price: "125.50",
            status: "MATCHED"
        },

        {
            tradeRef: "FX-20260730-0002",
            symbol: "EUR/USD",
            qty: 1000000,
            price: "1.0852",
            status: "PENDING"
        },

        {
            tradeRef: "EQU-20260730-0003",
            symbol: "AAPL",
            qty: 500,
            price: "178.20",
            status: "BREAK"
        },

        {
            tradeRef: "EQU-20260730-0004",
            symbol: "MSFT",
            qty: 250,
            price: "463.90",
            status: "MATCHED"
        },

        {
            tradeRef: "FX-20260730-0005",
            symbol: "GBP/USD",
            qty: 250000,
            price: "1.2761",
            status: "MATCHED"
        }

    ];

    // ------------------------------------------------------------------------
    // Display demo events every 2 seconds
    // ------------------------------------------------------------------------

    let index = 0;

    function publishNextTrade() {

        if (index >= demoTrades.length) {
            index = 0;
        }

        prependTrade(demoTrades[index]);

        index++;
    }

    // Show first trade immediately.

    publishNextTrade();

    // Continue streaming.

    setInterval(publishNextTrade, 2000);

    // ------------------------------------------------------------------------
    // REAL SSE IMPLEMENTATION (Reference)
    // ------------------------------------------------------------------------
    /*
    const eventSource = new EventSource("/api/v1/trades/stream");

    eventSource.onmessage = function (event) {

        const trade = JSON.parse(event.data);

        prependTrade(trade);
    };

    eventSource.onerror = function () {

        console.error("SSE connection lost.");

    };
    */

})();
