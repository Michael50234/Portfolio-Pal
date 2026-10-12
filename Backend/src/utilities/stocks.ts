import redisClient from "../redisClient";
import type { AlpacaAsset } from "../types/alpacaApi";
import type { StockListItem } from "../types/stock";

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

export const getStockList = async (): Promise<StockListItem[]> => {
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
