const express = require('express');
const router = express.Router();
const {
    createSpot,
    getNearbySpots,
    getParkingDashboardStats,
    getMySpots,
    updateSpot,
    deleteSpot
} = require('../controllers/parkingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Parking Owner', 'Admin'), createSpot);
router.get('/nearby', getNearbySpots);
router.get('/stats', protect, authorize('Parking Owner'), getParkingDashboardStats);
router.get('/my-spots', protect, authorize('Parking Owner'), getMySpots);
router.put('/:id', protect, authorize('Parking Owner'), updateSpot);
router.delete('/:id', protect, authorize('Parking Owner'), deleteSpot);

module.exports = router;
