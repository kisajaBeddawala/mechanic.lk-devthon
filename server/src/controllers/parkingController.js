const asyncHandler = require('express-async-handler');
const ParkingSpot = require('../models/ParkingSpot');
const Booking = require('../models/Booking');

// @desc    List a parking spot
// @route   POST /api/parking
// @access  Private (Parking Owner)
const createSpot = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        location,
        pricePerHour,
        dailyMaxRate,
        vehicleTypes,
        availability,
        features,
        images
    } = req.body;

    if (!location || !location.coordinates || location.coordinates.length !== 2) {
        res.status(400);
        throw new Error('Valid location coordinates [longitude, latitude] are required');
    }

    const spot = await ParkingSpot.create({
        owner: req.user.id,
        title,
        description,
        location,
        pricePerHour,
        dailyMaxRate,
        vehicleTypes,
        availability,
        features,
        images
    });

    res.status(201).json(spot);
});

// @desc    Get nearby parking spots
// @route   GET /api/parking/nearby
// @access  Public
const getNearbySpots = asyncHandler(async (req, res) => {
    const { long, lat, radius } = req.query;

    if (!long || !lat) {
        res.status(400);
        throw new Error('Please provide longitude and latitude');
    }

    const maxDistance = radius ? (parseInt(radius) * 1000) : 5000; // default 5km

    const spots = await ParkingSpot.find({
        'availability.isAvailable': true,
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(long), parseFloat(lat)]
                },
                $maxDistance: maxDistance
            }
        }
    }).populate('owner', 'name');

    res.json({
        count: spots.length,
        data: spots
    });
});

// @desc    Get parking dashboard stats
// @route   GET /api/parking/stats
// @access  Private (Parking Owner)
const getParkingDashboardStats = asyncHandler(async (req, res) => {
    const spots = await ParkingSpot.find({ owner: req.user.id });

    const totalSpots = spots.length;
    // Fix: correctly access nested availability.isAvailable
    const occupiedSpots = spots.filter(spot => spot.availability && spot.availability.isAvailable === false).length;

    // Calculate real revenue from completed bookings
    const spotIds = spots.map(s => s._id);
    const completedBookings = await Booking.find({
        parkingSpot: { $in: spotIds },
        status: { $in: ['completed', 'confirmed'] }
    });
    const revenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Count bookings
    const allBookings = await Booking.find({ parkingSpot: { $in: spotIds } });
    const totalBookings = allBookings.length;
    const pendingBookings = allBookings.filter(b => b.status === 'pending').length;

    res.json({
        totalSpots,
        occupiedSpots,
        revenue,
        occupancyRate: totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0,
        totalBookings,
        pendingBookings
    });
});

// @desc    Get logged in user's parking spots
// @route   GET /api/parking/my-spots
// @access  Private (Parking Owner)
const getMySpots = asyncHandler(async (req, res) => {
    const spots = await ParkingSpot.find({ owner: req.user.id }).sort('-createdAt');
    res.json(spots);
});

// @desc    Update a parking spot (sanitized - only allowed fields)
// @route   PUT /api/parking/:id
// @access  Private (Parking Owner)
const updateSpot = asyncHandler(async (req, res) => {
    const spot = await ParkingSpot.findOne({ _id: req.params.id, owner: req.user.id });

    if (!spot) {
        res.status(404);
        throw new Error('Parking spot not found or not authorized');
    }

    // Only allow updating specific fields (prevent owner/bookings overwrite)
    const allowedFields = [
        'title', 'description', 'location', 'pricePerHour', 'dailyMaxRate',
        'isPeakPricingActive', 'vehicleTypes', 'availability', 'features', 'images'
    ];

    const updateData = {};
    for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
            updateData[key] = req.body[key];
        }
    }

    const updatedSpot = await ParkingSpot.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    res.json(updatedSpot);
});

// @desc    Delete a parking spot
// @route   DELETE /api/parking/:id
// @access  Private (Parking Owner)
const deleteSpot = asyncHandler(async (req, res) => {
    const spot = await ParkingSpot.findOne({ _id: req.params.id, owner: req.user.id });

    if (!spot) {
        res.status(404);
        throw new Error('Parking spot not found or not authorized');
    }

    // Check for active bookings
    const activeBookings = await Booking.find({
        parkingSpot: spot._id,
        status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings.length > 0) {
        res.status(400);
        throw new Error('Cannot delete spot with active bookings. Cancel or complete them first.');
    }

    await ParkingSpot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Parking spot deleted successfully' });
});

module.exports = {
    createSpot,
    getNearbySpots,
    getParkingDashboardStats,
    getMySpots,
    updateSpot,
    deleteSpot
};
