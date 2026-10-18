export type StockListItem = {
    name: string,
    ticker: string
}

export type StockSnapshot = {
    ticker: string;                 // from the request
    name: string;                   // from cached stock list (not in Alpaca's snapshot)

    // From Alpaca
    price: number | null;           // latestTrade.p
    priceTime: string | null;       // latestTrade.t (ISO time of that trade, for "as of" and the stale marker)
    open: number | null;            // dailyBar.o
    dayHigh: number | null;         // dailyBar.h
    dayLow: number | null;          // dailyBar.l
    volume: number | null;          // dailyBar.v
    bid: number | null;             // latestQuote.bp (what buyers offer)
    ask: number | null;             // latestQuote.ap (what sellers want)

    // Calculated by us
    previousClose: number | null;   // prevDailyBar.c, or dailyBar.c if dailyBar is still yesterday's (before the open)
    change: number | null;          // price - previousClose
    changePct: number | null;       // change / previousClose * 100
}

export type TopMovers = {
    gainers: {
        change: Number,
        percent_change: Number,
        price: Number, 
        symbol: String,
    }[],
    losers: {
        change: Number,
        percent_change: Number,
        price: Number, 
        symbol: String,
    }[]
}
