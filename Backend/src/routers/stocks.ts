import "dotenv/config"
import express from "express"

import redisClient from "../redisClient";
import sendError from "../utilities/error";
import type { StockListItem, StockSnapshot, TopMovers } from "../types/stocks";
import { getStockGraphQueryParams, getStockSnapshotsQueryParams, searchStockQueryParams, ticker } from "../validation/stockSchemas";
import { getStockList, scoreMatch } from "../utilities/stocks";
import type { AlpacaSnapshot } from "../types/alpacaApi";

export const stocksRouter = express.Router();

// Returns the name and ticker of matching stocks
// Takes page, limit, and search text
stocksRouter.get('/', async (req, res) => {
    const parsed = searchStockQueryParams.safeParse(req.query);

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
    const parsed = getStockSnapshotsQueryParams.safeParse(req.query);
    if(!parsed.success) {
        return sendError(400, "Bad request", res);
    }

    const tickers = parsed.data.tickers;
    const toFetch = [];
    let alpacaSnapshots: Record<string, AlpacaSnapshot> = {};

    try {
        // Take data from cache if available, otherwise fetch
        for (const ticker of tickers) {
            let stock: string | null = null;
            try {
                stock = await redisClient.get(`snapshot:${ticker}`);
            } catch (err) {
                console.log(`Failed to read snapshot:${ticker} from cache`, err);
            }

            if(!stock) {
                toFetch.push(ticker);
            } else {
                alpacaSnapshots[ticker] = JSON.parse(stock);
            }
        }

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

        // Get stock list
        let stockList = await getStockList();

        const stockDetailsList: Record<string, StockSnapshot> = {}

        for (const key in alpacaSnapshots) {
            let name = "";

            for (const stock of stockList) {
                if(stock.ticker == key) {
                    name = stock.name;
                }
            }
            
            let change = null;
            let changePct = null;
            if (alpacaSnapshots[key]?.prevDailyBar?.c && alpacaSnapshots[key]?.latestTrade?.p) {
                change = alpacaSnapshots[key].latestTrade.p - alpacaSnapshots[key].prevDailyBar.c;
                changePct = Math.round(change / alpacaSnapshots[key].prevDailyBar.c * 100);
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
                await redisClient.setEx("top-movers", 60 * 5, data);
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
stocksRouter.get('/:ticker/graph', (req, res) => {
    const parsedParams = ticker.safeParse(req.params);
    const parsedQuery = getStockGraphQueryParams.safeParse(req.query)
})




