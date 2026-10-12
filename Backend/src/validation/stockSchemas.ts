import z from "zod"

export const searchStockQueryParams = z.object({
    searchText: z.string().trim().toLowerCase(), 
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const getStockSnapshotsQueryParams = z.object({
    tickers: z.array(z.string().min(1))
}).strict()
