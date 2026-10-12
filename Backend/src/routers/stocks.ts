import "dotenv/config"
import express from "express"

import redisClient from "../redisClient";
import sendError from "../utilities/error";
import type { StockListItem } from "../types/stock";
import type { AlpacaAsset } from "../types/alpacaApi";
import { searchStockQueryParams } from "../validation/stockSchemas";

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

    // Get JSON stock list
    let stockListJSON = await redisClient.get("stockList");

    if(!stockListJSON) {
        try {
            const response = await fetch("https://api.alpaca.markets/v2/assets?status=active", {
                method: "GET",
                headers: {
                    "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
                    "APCA-API-SECRET-KEY": process.env.ALPACA_API_SECRET_KEY!,
                }
            });

            if(!response.ok) {
                return sendError(500, "Internal server error", res);
            }

            const body: AlpacaAsset[] = await response.json();
            const stockList = createSlimList(body);

            stockListJSON = JSON.stringify(stockList);

            // Make data stale after 24 hours
            await redisClient.setEx("stockList", 60 * 60 * 24, JSON.stringify(stockList));            
        } catch {
            return sendError(500, "Internal server error", res)
        }
    }

    // Convert JSON stock list to array
    const stockList: StockListItem[] = JSON.parse(stockListJSON);

    // Sort the stockList based on searchText scoring
    const sortedStockList = stockList
        .map((stock) => { return {score: scoreMatch(stock, searchText), ...stock} })
        .filter((stock) => stock.score != 0 )
        .sort((a, b) => b.score - a.score)
        .map((stock) => { return { ticker: stock.ticker, name: stock.name } })

    const result = sortedStockList.slice(offset, offset + limit);
    
    return res.status(200).json({
        stocks: result
    });
})

// Returns the full details of a stock or a list of stocks
stocksRouter.get('/snapshots', (req, res) => {

})

// Establishes a web socket connection for sending real time data for a stock
stocksRouter.get('/real-time-data/:ticker', (req, res) => {

})

// Returns the over time graph for a stock
stocksRouter.get('/:ticker/graph', (req, res) => {

})





