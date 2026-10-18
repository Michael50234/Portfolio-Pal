import "dotenv/config"
import express from "express"

import redisClient from "../redisClient";
import sendError from "../utilities/error";
import type { HistoricalBar, StockListItem, StockSnapshot, TopMovers } from "../types/stocks";
import { getStockGraphQuerySchema, getStockSnapshotsQuerySchema, searchStockQuerySchema, tickerSchema } from "../validation/stockSchemas";
import { getStockGraphParams, getStockList, scoreMatch } from "../utilities/stocks";
import type { AlpacaHistoricalBar, AlpacaSnapshot } from "../types/alpacaApi";

export const stocksRouter = express.Router();

// Returns the name and ticker of matching stocks
// Takes page, limit, and search text
stocksRouter.get('/', async (req, res) => {
    const parsed = searchStockQuerySchema.safeParse(req.query);

    if(!parsed.success) {
        return sendError(400, "Bad request", res);
    }

    const { page, limit, searchText } = parsed.data;
    // Since first page is 1
    const offset = (page - 1) * limit;

    // Get stock list
    let stockList: StockListItem[];
    try {
        stockList = await getStockList();
    } catch (err) {
        console.log("Failed to fetch stock list", err);
        return sendError(500, "Internal server error", res);
    }

    // Sort the stockList based on searchText scoring
    const sortedStockList = stockList
        .map((stock) => { return {score: scoreMatch(stock, searchText), ...stock} })
        .filter((stock) => stock.score != 0 )
        .sort((a, b) =>
            b.score - a.score ||
            a.ticker.length - b.ticker.length ||
            a.ticker.localeCompare(b.ticker)
        )
        .map((stock) => { return { ticker: stock.ticker, name: stock.name } })

    const result = sortedStockList.slice(offset, offset + limit);
    
    return res.status(200).json({
        stocks: result
    });
})

// Returns the full details of a stock or a list of stocks
// Takes a list of tickers in query params
stocksRouter.get('/snapshots', async (req, res) => {
    const parsed = getStockSnapshotsQuerySchema.safeParse(req.query);
    if(!parsed.success) {
        return sendError(400, "Bad request", res);
    }

    const tickers = parsed.data.tickers;
    const toFetch: string[] = [];
    let alpacaSnapshots: Record<string, AlpacaSnapshot> = {};

    try {
        // Get stock list
        const stockList = await getStockList();

        // Reject the request if any ticker isn't a known stock
        const knownTickers = new Set(stockList.map((stock) => stock.ticker));
        const unknownTickers = tickers.filter((ticker) => !knownTickers.has(ticker));

        if(unknownTickers.length > 0) {
            return sendError(400, `Unknown tickers: ${unknownTickers.join(", ")}`, res);
        }

        // Take data from cache if available, otherwise fetch
        let cached: (string | null)[] = tickers.map(() => null);
        try {
            cached = await redisClient.mGet(tickers.map((ticker) => `snapshot:${ticker}`));
        } catch (err) {
            console.log("Failed to read snapshots from cache", err);
        }

        tickers.forEach((ticker, i) => {
            const stock = cached[i];

            if(!stock) {
                toFetch.push(ticker);
            } else {
                alpacaSnapshots[ticker] = JSON.parse(stock);
            }
        });

        let data: Record<string, AlpacaSnapshot> = {};
        if(toFetch.length > 0) {
            // Add searchParams to api address
            const apiURL = new URL("https://data.alpaca.markets/v2/stocks/snapshots");
            apiURL.searchParams.set("currency", "CAD");
            apiURL.searchParams.set("symbols", toFetch.join(","));

            // fetch snapshots for non-cached stocks
            const response = await fetch(apiURL.toString(), {
                method: "GET",
                headers: {
                    "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
                    "APCA-API-SECRET-KEY": process.env.ALPACA_API_SECRET_KEY!
                }
            });

            if(!response.ok) {
                throw new Error("Failed to fetch stock snapshots from Alpaca");
            }

            data = await response.json();

            // Add snapshots to cache
            for (const key in data) {
                try {
                    await redisClient.setEx(`snapshot:${key}`, 60 * 5, JSON.stringify(data[key]));
                } catch (err) {
                    console.log(`Failed to write snapshot:${key} to cache`, err);
                }
            }
        }

        alpacaSnapshots = {
            ...alpacaSnapshots,
            ...data
        }

        const stockDetailsList: Record<string, StockSnapshot> = {}
        const namesByTicker = new Map(stockList.map((stock) => [stock.ticker, stock.name]));

        for (const key in alpacaSnapshots) {
            const name = namesByTicker.get(key) ?? "";

            let change = null;
            let changePct = null;
            if (alpacaSnapshots[key]?.prevDailyBar?.c && alpacaSnapshots[key]?.latestTrade?.p) {
                const rawChange = alpacaSnapshots[key].latestTrade.p - alpacaSnapshots[key].prevDailyBar.c;
                change = Math.round(rawChange * 100) / 100;
                changePct = Math.round(rawChange / alpacaSnapshots[key].prevDailyBar.c * 10000) / 100;
            }

            stockDetailsList[key] = {
                ticker: key,
                name: name,
                price: alpacaSnapshots[key]?.latestTrade?.p ?? null,
                priceTime: alpacaSnapshots[key]?.latestTrade?.t ?? null,
                open: alpacaSnapshots[key]?.dailyBar?.o ?? null,
                dayHigh: alpacaSnapshots[key]?.dailyBar?.h ?? null,
                dayLow: alpacaSnapshots[key]?.dailyBar?.l ?? null,
                volume: alpacaSnapshots[key]?.dailyBar?.v ?? null,
                bid: alpacaSnapshots[key]?.latestQuote?.bp ?? null,
                ask: alpacaSnapshots[key]?.latestQuote?.ap ?? null,
                previousClose: alpacaSnapshots[key]?.prevDailyBar?.c ?? null,
                change: change,
                changePct: changePct,
            };
        }

        return res.status(200).json({
            stockDetails: stockDetailsList
        });
    } catch {
        console.log("Failed to fetch stock snapshots")
        return sendError(500, "Internal server error", res)
    }

})

// Returns top 10 gainers and losers
stocksRouter.get('/top-movers', async (req, res) => {
    let alpacaTopMovers: TopMovers; 
    let topMovers: TopMovers;
    let cache = null;

    try {


        try {
            cache = await redisClient.get("top-movers");
        } catch(error) {
            console.log("Failed to read cache");
        }

        if(cache) {
            alpacaTopMovers = JSON.parse(cache);
        } else {
            const response = await fetch('https://data.alpaca.markets/v1beta1/screener/stocks/movers?top=10', {
                method: "GET",
                headers: {
                    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY!,
                    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY!,
                },
            });

            if(!response.ok) {
                throw new Error("Failed to fetch top movers from Alpaca");
            }

            const data = await response.json();

            try {
                await redisClient.setEx("top-movers", 60 * 5, JSON.stringify(data));
            } catch(error) {
                console.log("Failed to cache top-movers")
            }

            alpacaTopMovers = data;
        }

        topMovers = {
            gainers: alpacaTopMovers.gainers,
            losers: alpacaTopMovers.losers,
        };

        return res.status(200).json(topMovers);
    } catch(error) {
        console.log("Failed to fetch top movers");
        return sendError(500, "Internal server error", res);
    }
})

// Establishes a web socket connection for sending real time data for a stock
stocksRouter.get('/real-time-data/:ticker', (req, res) => {

})

// Returns the over time graph for a stock
stocksRouter.get('/:ticker/graph', async (req, res) => {
    const parsedParams = tickerSchema.safeParse(req.params.ticker);
    const parsedQuery = getStockGraphQuerySchema.safeParse(req.query);

    if(!parsedParams.success || !parsedQuery.success) {
        return sendError(400, "Bad Request", res);
    }

    const ticker = parsedParams.data;
    const { timePeriod } = parsedQuery.data;

    try {
        const { start, end, timeframe } = await getStockGraphParams(timePeriod);

        const apiURL = new URL("https://data.alpaca.markets/v2/stocks/bars");
        // Set query params
        apiURL.searchParams.set("symbols", ticker);
        apiURL.searchParams.set("timeframe", timeframe);
        apiURL.searchParams.set("start", start);
        apiURL.searchParams.set("end", end);
        apiURL.searchParams.set("limit", "10000");
        apiURL.searchParams.set("adjustment", "raw");
        apiURL.searchParams.set("feed", "sip");
        apiURL.searchParams.set("currency", "CAD");

        const response = await fetch(apiURL.toString(), {
            method: "GET",
            headers: {
                'APCA-API-KEY-ID': process.env.ALPACA_API_KEY!,
                'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY!,
            },
        });

        if(!response.ok) {
            throw new Error("Failed to fetch graph data");
        }

        const data = await response.json();
        const alpacaBars: AlpacaHistoricalBar[] | undefined = data?.bars?.[ticker];

        if(!alpacaBars) {
            return sendError(404, "No data found for ticker", res);
        }

        const bars: HistoricalBar[] = alpacaBars.map((alpacaBar) => {
            return {
                time: alpacaBar.t,
                price: alpacaBar.c
            }
        })

        return res.status(200).json(bars)
    } catch {
        console.log("Failed to fetch graph data");
        return sendError(500, "Internal server error", res);
    }

})




