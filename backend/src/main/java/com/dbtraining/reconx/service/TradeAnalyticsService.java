package com.dbtraining.reconx.service;

import com.dbtraining.reconx.model.EquityTrade;
import com.dbtraining.reconx.model.TradeType;
import org.springframework.stereotype.Service;
import com.dbtraining.reconx.model.BondTrade;
import com.dbtraining.reconx.model.DerivativeTrade;
import com.dbtraining.reconx.model.FXTrade;
import com.dbtraining.reconx.model.Side;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.mapping;
import static java.util.stream.Collectors.reducing;
import static java.util.stream.Collectors.toList;

/**
 * ============================================================================
 * TICKET-ADV034 — Trade analytics with Collectors (groupingBy + summarizing)
 * TICKET-ADV035 — VWAP calculator using Streams + custom collector
 * TICKET-ADV036 — P&L per instrument: stream reduction
 * ============================================================================
 */
@Service
public class TradeAnalyticsService {

    /** TICKET-ADV034 — count + sum of notional per counterparty. */
    public Map<Long, NotionalSummary> notionalByCounterparty(List<? extends TradeType> trades) {
        // TODO(TICKET-ADV034): Collectors.groupingBy(this::counterpartyIdOf,
        //   Collectors.collectingAndThen(toList(), list -> new NotionalSummary(
        //       list.size(),
        //       list.stream().map(t -> t.notional().amount()).reduce(ZERO, BigDecimal::add)))).
        if (trades == null || trades.isEmpty()) {
            return Map.of();
        }
    
        return trades.stream()
                .collect(groupingBy(
                        this::counterpartyIdOf,
                        collectingAndThen(
                                toList(),
                                list -> new NotionalSummary(
                                        list.size(),
                                        list.stream()
                                                .map(t -> t.notional().amount())
                                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                )
                        )
                ));
    }   

    /**
     * TICKET-ADV035 — VWAP = SUM(price * qty) / SUM(qty). Equity-only — only
     * EquityTrade has a meaningful price-volume pair.
     */
    public Map<String, BigDecimal> vwapByInstrument(List<EquityTrade> equityTrades) {
        // TODO(TICKET-ADV035): group by EquityTrade::instrumentSymbol, then for
        //   each bucket compute SUM(price * qty) / SUM(qty) using BigDecimal
        //   with RoundingMode.HALF_UP. Return BigDecimal.ZERO when totalQty is 0
        //   (avoid ArithmeticException on division by zero).
    if (equityTrades == null || equityTrades.isEmpty()) {
        return Map.of();
    }

    return equityTrades.stream()
            .collect(groupingBy(
                    EquityTrade::instrumentSymbol,
                    collectingAndThen(
                            toList(),
                            list -> {

                                BigDecimal totalValue = list.stream()
                                        .map(t -> t.price().multiply(t.quantity()))
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                BigDecimal totalQty = list.stream()
                                        .map(EquityTrade::quantity)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                if (totalQty.compareTo(BigDecimal.ZERO) == 0) {
                                    return BigDecimal.ZERO;
                                }

                                return totalValue.divide(totalQty, 8, RoundingMode.HALF_UP);
                            }
                    )
            ));
    }

    /** TICKET-ADV036 — P&L per instrument symbol (sign by Side). */
    public Map<String, BigDecimal> pnlByInstrument(List<EquityTrade> equityTrades) {
        // TODO(TICKET-ADV036): groupingBy(EquityTrade::instrumentSymbol,
        //   mapping(this::pnl, reducing(BigDecimal.ZERO, BigDecimal::add))).
        //   Side.SELL contributes positively; Side.BUY contributes negatively.
        if (equityTrades == null || equityTrades.isEmpty()) {
            return Map.of();
        }
    
        return equityTrades.stream()
                .collect(groupingBy(
                        EquityTrade::instrumentSymbol,
                        mapping(
                                this::pnl,
                                reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));
    }

    private BigDecimal pnl(EquityTrade t) {
        // TODO(TICKET-ADV036): BigDecimal abs = price * qty; SELL -> abs, BUY -> abs.negate().
        BigDecimal value = t.price().multiply(t.quantity());
        return t.side() == Side.SELL
                ? value
                : value.negate();
    }

    private long counterpartyIdOf(TradeType t) {
        private long counterpartyIdOf(TradeType t) {

    return switch (t) {
        case EquityTrade eq -> eq.counterpartyId();
        case FXTrade fx -> fx.counterpartyId();
        case BondTrade bond -> bond.counterpartyId();
        case DerivativeTrade derivative -> derivative.counterpartyId();
    };
}

    public record NotionalSummary(long count, BigDecimal total) {}
}
