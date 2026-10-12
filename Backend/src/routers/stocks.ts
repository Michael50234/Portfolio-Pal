import "dotenv/config"
import express from "express"

import redisClient from "../redisClient";
import sendError from "../utilities/error";
import type { StockListItem } from "../types/stock";
import { getStockSnapshotsQueryParams, searchStockQueryParams } from "../validation/stockSchemas";
import { getStockList, scoreMatch } from "../utilities/stocks";

export const stocksRouter = express.Router();

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





