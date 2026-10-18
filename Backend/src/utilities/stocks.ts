import redisClient from "../redisClient";
import type { AlpacaAsset } from "../types/alpacaApi";
import type { StockListItem } from "../types/stocks";
import sendError from "./error";

// Extract ticker and company name from stockList items
export const createSlimList = (stockList: AlpacaAsset[]): StockListItem[] => {
    const slimList = stockList.map((stock) => {
        return {
            ticker: stock.symbol,
            name: stock.name
        };
    });

    return slimList;
}

// Score each stock based on search text
export const scoreMatch = (stock: StockListItem, q: string) => {
    const ticker = stock.ticker.toLowerCase();
    const name = stock.name.toLowerCase();

    if (ticker === q) return 4;            // exact ticker
    if (ticker.startsWith(q)) return 3;    // ticker starts with
    if (name.startsWith(q)) return 2;      // name starts with
    if (name.includes(q)) return 1;        // name contains
    return 0;    
}

// Get a list of list of stock list items (name and ticker)
export const getStockList = async (): Promise<StockListItem[]> => {
    // Get stockList JSON
    let stockListJSON: string | null = null;
    try {
        stockListJSON = await redisClient.get("stockList");
    } catch (err) {
        console.log("Failed to read stockList from cache", err);
    }

    if(!stockListJSON) {
        const response = await fetch("https://api.alpaca.markets/v2/assets?status=active&asset_class=us_equity", {
            method: "GET",
            headers: {
                "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
                "APCA-API-SECRET-KEY": process.env.ALPACA_API_SECRET_KEY!,
            }
        });

        if(!response.ok) {
            throw new Error(`Alpaca assets request failed: ${response.status}`);
        }

        const body: AlpacaAsset[] = await response.json();
        const stockList = createSlimList(body);

        stockListJSON = JSON.stringify(stockList);

        // Make data stale after 24 hours
        try {
            await redisClient.setEx("stockList", 60 * 60 * 24, stockListJSON);
        } catch (err) {
            console.log("Failed to write stockList to cache", err);
        }
    }

    // Covert JSON to array
    return JSON.parse(stockListJSON);
}

type TimePeriod = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All"

type GraphParams = { timeframe: string; start: string; end: string };

type MarketDay = {
    date: string
}

const TIMEFRAMES: Record<TimePeriod, string> = {
    "1D": "5Min", "5D": "15Min", "1M": "1Hour", "6M": "1Day",
    "YTD": "1Day", "1Y": "1Day", "5Y": "1Week", "All": "1Month",
};

// Get the last daysToGet days where the market was open
const getUSMarketOpenDays = async (daysToGet: number) => {
    const start = new Date();
    const end = new Date();

    end.setDate(end.getDate() - 14);

    try {
        const response = await fetch(`https://paper-api.alpaca.markets/v2/calendar?date_type=TRADING&start=${start.toISOString()}&end=${end.toISOString()}`, {
            method: 'GET',
            headers: {
                'APCA-API-KEY-ID': process.env.ALPACA_API_KEY!,
                'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY!,
            }
        });

        if(!response.ok) {
            throw new Error();
        }

        const data: MarketDay[] = await response.json();

        return data.slice(-daysToGet)
    } catch {
        console.log("Failed to get market open days")
        throw new Error("Failed to get market open dats")
    }
}

// Get the date of the earliest of the last daysToGet market open days
const getOpenDayStart = async (daysToGet: number): Promise<string> => {
    const openDays = await getUSMarketOpenDays(daysToGet);
    const date = openDays[0]?.date;
    if (!date) throw new Error("No market open days found");
    return date;
}

// Get the date that is the given number of months before now
const monthsAgo = (months: number): string => {
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    return start.toISOString();
}

// Get the start date for getting stock graph data given the desired timePeriod
const getStartDate = async (timePeriod: TimePeriod): Promise<string> => {
    // Earliest date to request for the "All" time period
    const EARLIEST_START = new Date("2016-01-01T00:00:00Z").toISOString();

    switch (timePeriod) {
        case "1D":
            return getOpenDayStart(1);
        case "5D":
            return getOpenDayStart(5);
        case "1M":
            return monthsAgo(1);
        case "6M":
            return monthsAgo(6);
        case "YTD": {
            const start = new Date();
            start.setMonth(0, 1); // January 1st (months are 0-indexed)
            return start.toISOString();
        }
        case "1Y":
            return monthsAgo(12);
        case "5Y":
            return monthsAgo(60);
        case "All":
            return EARLIEST_START;
    }
}

// Returns timeframe, start, end for the graph
// Takes time period that we want data for
export const getStockGraphParams = async (timePeriod: TimePeriod): Promise<GraphParams> => {
    // End time is 15 minutes from now because of the limitations of the free api plan
    const end = new Date(Date.now() - 1000 * 60 * 15).toISOString();
    const start = await getStartDate(timePeriod)

    return {
        timeframe: TIMEFRAMES[timePeriod],
        start: start,
        end: end
    }
}