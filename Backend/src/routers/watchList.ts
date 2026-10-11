import express from "express"

export const watchListRouter = express.Router();

// Search watchList
watchListRouter.get('', (req, res) => {

})


watchListRouter.route('/:stock-ticker')
    // Create watchListItem
    .post((req, res) => {
        
    })
    // Delete watchListItem
    .delete((req, res) => {

    })