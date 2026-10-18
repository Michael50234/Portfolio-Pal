// Type only the properties you need from output, you don't have to type everything
export type AlpacaAsset = {
    name: string,
    symbol: string
}

type AlpacaBar = {
    o: number;   // open
    h: number;   // high
    l: number;   // low
    c: number;   // close
    v: number;   // volume
    t: string;   // start time of the bar (ISO)
};

// Alpaca's snapshot for one ticker (GET /v2/stocks/snapshots).
// Only the fields we read are listed. Alpaca sends more.
// Everything is optional because a thinly traded ticker may be missing parts.
export type AlpacaSnapshot = {
    latestTrade?: {
        p: number;   // price
        t: string;   // time of the trade (ISO)
    };
    latestQuote?: {
        bp: number;  // bid price
        ap: number;  // ask price
    };
    dailyBar?: AlpacaBar;       // today's bar (yesterday's before the open)
    prevDailyBar?: AlpacaBar;   // the bar before dailyBar
};