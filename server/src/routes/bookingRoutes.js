const express = require('express');
const router = express.Router();
const {
    createParkingBooking,
    getMyBookings,
    updateBookingStatus,
    getOwnerBookings,
    updateBookingStatusByOwner
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Driver routes
router.post('/parking', protect, authorize('Driver'), createParkingBooking);
router.get('/my', protect, authorize('Driver'), getMyBookings);
router.put('/:id/status', protect, authorize('Driver'), updateBookingStatus);

// Parking Owner routes
router.get('/owner', protect, authorize('Parking Owner'), getOwnerBookings);
router.put('/:id/owner-status', protect, authorize('Parking Owner'), updateBookingStatusByOwner);

module.exports = router;
