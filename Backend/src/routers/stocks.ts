import "dotenv/config"
import express from "express"

import redisClient from "../redisClient";
import sendError from "../utilities/error";
import type { StockListItem } from "../types/stock";
import type { AlpacaAsset } from "../types/alpacaApi";
import { getStockSnapshotsQueryParams, searchStockQueryParams } from "../validation/stockSchemas";

export const stocksRouter = express.Router();

// Extract ticker and company name from stockList items
const createSlimList = (stockList: AlpacaAsset[]): StockListItem[] => {
    const slimList = stockList.map((stock) => {
        return {
            ticker: stock.symbol,
            name: stock.name
        };
    });

    return slimList;
}

// Score each stock based on search text
const scoreMatch = (stock: StockListItem, q: string) => {
    const ticker = stock.ticker.toLowerCase();
    const name = stock.name.toLowerCase();

    if (ticker === q) return 4;            // exact ticker
    if (ticker.startsWith(q)) return 3;    // ticker starts with
    if (name.startsWith(q)) return 2;      // name starts with
    if (name.includes(q)) return 1;        // name contains
    return 0;    
}

const getStockList = async (): Promise<StockListItem[]> => {
    // Get stockList JSON
    let stockListJSON = await redisClient.get("stockList");

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
        await redisClient.setEx("stockList", 60 * 60 * 24, stockListJSON);
    }

    // Covert JSON to array
    return JSON.parse(stockListJSON);
}


// Search For Stocks based on company name and ticker
// Returns ticker and name of matches
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
stocksRouter.get('/snapshots', async (req, res) => {
    const parsed = getStockSnapshotsQueryParams.safeParse(req.query);
    if(!parsed.success) {
        return sendError(400, "Bad request", res);
    }

    const tickers = parsed.data.tickers;
    const toFetch = [];
    const result = [];

    try {
        // Take data from cache if available, otherwise fetch
        for (const ticker in tickers) {
            const stock = await redisClient.get(`snapshot:${ticker}`);
            if(!stock) {
                toFetch.push(ticker);
            } else {
                result.push(stock);
            }
        }

        // Add searchParams to api address
        const apiURL = new URL("https://data.alpaca.markets/v2/stocks/snapshots");
        apiURL.searchParams.set("currency", "CAD");
        apiURL.searchParams.set("symbols", toFetch.join(","));

        const response = await fetch(apiURL.toString(), {
            method: "GET",
            headers: {
                "ALPACA_API_KEY": process.env.ALPACA_API_KEY!,
                "ALPACA_API_SECRET_KEY": process.env.ALPACA_API_SECRET_KEY!
            }
        });

        const data = await response.json();

    } catch {
        console.log("Failed to fetch stock snapshots")
        return sendError(500, "Internal server error", res)
    }

})

// Establishes a web socket connection for sending real time data for a stock
stocksRouter.get('/real-time-data/:ticker', (req, res) => {

})

// Returns the over time graph for a stock
stocksRouter.get('/:ticker/graph', (req, res) => {

})





