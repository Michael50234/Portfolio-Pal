import express from "express"


export const tradesRouter = express.Router();

// Create buy trade
tradesRouter.post('/buy', (req, res) => {

})

// Create sell trade
tradesRouter.post('/sell', (req, res) => {

})

// Search trades
tradesRouter.get('', () => {

})

// Delete trade
// Pass id's of trades as query params
tradesRouter.delete('/', (req, res) => {
    
})
