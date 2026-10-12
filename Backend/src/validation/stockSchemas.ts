import z from "zod"

export const searchStockQueryParams = z.object({
    searchText: z.string().trim().lowercase(), 
    page: z.string().min(1).default("1").transform((page) => Number(page)),
    limit: z.string().transform((limit) => Number(limit)),
});

