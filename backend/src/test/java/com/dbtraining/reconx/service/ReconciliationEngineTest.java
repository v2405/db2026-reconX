package com.dbtraining.reconx.service;

import com.dbtraining.reconx.dto.ReconResult;
import com.dbtraining.reconx.model.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * TICKET-ADV040 / ADV041 / ADV042 — TDD: write the test FIRST, then the impl.
 */
class ReconciliationEngineTest {

    private final ReconciliationEngine engine = new ReconciliationEngine();

    @Test
    void testReconcile_exactMatch_returnsMatched() {
        // TODO(TICKET-ADV040): two identical EquityTrades + EXACT rule -> one ReconResult with status MATCHED.
        EquityTrade internal = equity("SAP-20260603-0001", "100.00", "10");
        EquityTrade external = equity("SAP-20260603-0001", "100.00", "10");

        List<ReconResult> result = engine.reconcile(
                List.of(internal),
                List.of(external),
                ReconciliationRule.EXACT
        );

        assertThat(result).hasSize(1);

        assertThat(result.get(0).status())
                .isEqualTo(ReconResult.Status.MATCHED);
    }

    @Test
    void testReconcile_priceTolerance_withinThreshold() {
        // TODO(TICKET-ADV041): prices 100.00 vs 100.50 + PRICE_TOLERANCE_1PCT rule -> status MATCHED.
        EquityTrade internal = equity("SAP-20260603-0002", "100.00", "10");
        EquityTrade external = equity("SAP-20260603-0002", "100.50", "10");

        List<ReconResult> result = engine.reconcile(
                List.of(internal),
                List.of(external),
                ReconciliationRule.PRICE_TOLERANCE_1PCT
        );

        assertThat(result).hasSize(1);

        assertThat(result.get(0).status())
                .isEqualTo(ReconResult.Status.MATCHED);
    }

    @Test
    void testReconcile_missingCounterpartyTrade_returnsBreak() {
        // TODO(TICKET-ADV042): internal trade with no external counterpart -> status BREAK,
        //                     discrepancyType = "MISSING_EXTERNAL".
        EquityTrade internal = equity("SAP-20260603-0003", "100.00", "10");
        List<ReconResult> result = engine.reconcile(
                List.of(internal),
                List.of(),
                ReconciliationRule.EXACT
        );
        assertThat(result).hasSize(1);
        assertThat(result.get(0).status())
                .isEqualTo(ReconResult.Status.BREAK);
        assertThat(result.get(0).discrepancyType())
                .isEqualTo("MISSING_EXTERNAL");
    }

    @Test
    void testReconcile_emptyInternal_returnsEmpty() {
        // TODO(TICKET-ADV040): empty internal + empty external -> reconcile returns an empty list.
        List<ReconResult> result = engine.reconcile(
                List.of(),
                List.of(),
                ReconciliationRule.EXACT
        );

        assertThat(result).isEmpty();
    }

    private EquityTrade equity(String ref, String price, String qty) {
        return EquityTrade.builder()
                .tradeRef(TradeRef.of(ref))
                .instrumentSymbol("SAP.DE")
                .price(new BigDecimal(price))
                .quantity(new BigDecimal(qty))
                .currency("EUR").side(Side.BUY)
                .tradeDate(LocalDate.of(2026, 6, 3))
                .counterpartyId(1L)
                .build();
    }
}
