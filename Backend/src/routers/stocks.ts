import express from "express"


export const stocksRouter = express.Router();

// Search For Stocks
// Returns ticker and name of matches
stocksRouter.get('', (req, res) => {
    
})

// Returns the overtime graph for a stock
stocksRouter.get('/:stock-ticker/graph', (req, res) => {

})

// Returns the full details of a stock
stocksRouter.get('/:stock-ticker', (req, res) => {

})

