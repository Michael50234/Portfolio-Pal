import z from "zod"

export const searchStockQuerySchema = z.object({
    searchText: z.string().trim().toLowerCase(), 
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getStockSnapshotsQuerySchema = z.object({
    // Accepts ?tickers=AAPL,MSFT and ?tickers=AAPL&tickers=MSFT
    tickers: z.union([z.string(), z.array(z.string())])
        .transform(v =>
            (Array.isArray(v) ? v : [v])
                .flatMap(s => s.split(","))
                .map(t => t.trim().toUpperCase())
                .filter(Boolean)
        )
        .refine(arr => arr.length > 0)
}).strict()

export const getStockGraphQuerySchema = z.object({
    timePeriod: z.enum(["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "All"])
})

export const tickerSchema = z.string().transform((t) => t.trim().toUpperCase())