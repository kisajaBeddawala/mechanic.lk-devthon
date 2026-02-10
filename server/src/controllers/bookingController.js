const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

// @desc    Create a parking booking (with overlap detection and daily max rate cap)
// @route   POST /api/bookings/parking
// @access  Private (Driver)
const createParkingBooking = asyncHandler(async (req, res) => {
    const { parkingSpot, startTime, endTime } = req.body;

    if (!parkingSpot || !startTime || !endTime) {
        res.status(400);
        throw new Error('Parking spot, start time and end time are required');
    }

    const spot = await ParkingSpot.findById(parkingSpot);
    if (!spot) {
        res.status(404);
        throw new Error('Parking spot not found');
    }

    if (!spot.availability || spot.availability.isAvailable === false) {
        res.status(400);
        throw new Error('This parking spot is currently unavailable');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
        res.status(400);
        throw new Error('End time must be after start time');
    }

    // Double-booking prevention: check for overlapping bookings
    const overlapping = await Booking.findOne({
        parkingSpot,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
    });

    if (overlapping) {
        res.status(409);
        throw new Error('This spot is already booked for the selected time period');
    }

    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    let totalPrice = hours * spot.pricePerHour;

    // Enforce daily max rate cap if set
    if (spot.dailyMaxRate && spot.dailyMaxRate > 0) {
        totalPrice = Math.min(totalPrice, spot.dailyMaxRate);
    }

    const booking = await Booking.create({
        user: req.user.id,
        parkingSpot,
        startTime: start,
        endTime: end,
        totalPrice
    });

    spot.bookings.push(booking._id);
    await spot.save();

    res.status(201).json(booking);
});

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my
// @access  Private (Driver)
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id })
        .populate('parkingSpot', 'title location pricePerHour')
        .sort('-createdAt');
    res.json(bookings);
});

// @desc    Update booking status (driver)
// @route   PUT /api/bookings/:id/status
// @access  Private (Driver)
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    if (booking.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized');
    }

    booking.status = status;
    const updated = await booking.save();
    res.json(updated);
});

// @desc    Get bookings for parking owner's spots
// @route   GET /api/bookings/owner
// @access  Private (Parking Owner)
const getOwnerBookings = asyncHandler(async (req, res) => {
    // Find all spots owned by this user
    const spots = await ParkingSpot.find({ owner: req.user.id });
    const spotIds = spots.map(s => s._id);

    const bookings = await Booking.find({ parkingSpot: { $in: spotIds } })
        .populate('user', 'name email phone')
        .populate('parkingSpot', 'title location pricePerHour')
        .sort('-createdAt');

    res.json(bookings);
});

// @desc    Update booking status by parking owner (confirm/reject/complete)
// @route   PUT /api/bookings/:id/owner-status
// @access  Private (Parking Owner)
const updateBookingStatusByOwner = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const allowedStatuses = ['confirmed', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    const booking = await Booking.findById(req.params.id).populate('parkingSpot');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Verify this booking belongs to a spot owned by this user
    const spot = await ParkingSpot.findOne({ _id: booking.parkingSpot._id || booking.parkingSpot, owner: req.user.id });
    if (!spot) {
        res.status(403);
        throw new Error('Not authorized - this booking is not for your spot');
    }

    booking.status = status;
    const updated = await booking.save();
    res.json(updated);
});

module.exports = {
    createParkingBooking,
    getMyBookings,
    updateBookingStatus,
    getOwnerBookings,
    updateBookingStatusByOwner
};
