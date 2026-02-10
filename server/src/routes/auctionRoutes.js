const express = require('express');
const router = express.Router();
const {
    createAuction,
    getAuctions,
    getAuctionById,
    placeBid,
    getDriverAuctions,
    acceptBid,
    updateAuctionStatus,
    getMyBids,
    getMyBidStats
} = require('../controllers/auctionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAuctions)
    .post(protect, authorize('Driver'), createAuction);

// Garage Owner specific routes
router.get('/garage', protect, authorize('Garage Owner'), getAuctions);
router.get('/my-bids', protect, authorize('Garage Owner'), getMyBids);
router.get('/my-bids/stats', protect, authorize('Garage Owner'), getMyBidStats);

// Driver specific routes
router.get('/driver', protect, authorize('Driver'), getDriverAuctions);

router.route('/:id')
    .get(protect, getAuctionById);

router.route('/:id/bid')
    .post(protect, authorize('Garage Owner'), placeBid);

router.route('/:id/accept-bid')
    .put(protect, authorize('Driver'), acceptBid);

router.route('/:id/status')
    .put(protect, authorize('Driver'), updateAuctionStatus);

module.exports = router;
