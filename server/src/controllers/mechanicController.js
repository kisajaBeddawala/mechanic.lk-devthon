const asyncHandler = require('express-async-handler');
const Mechanic = require('../models/Mechanic');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
}).array('images', 5);

// @desc    Create or update mechanic profile
// @route   POST /api/mechanics
// @access  Private (Garage Owner)
const updateProfile = asyncHandler(async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { businessName, description, isOnline, serviceRadius } = req.body;

        let location = req.body.location;
        let services = req.body.services;

        try {
            if (typeof location === 'string') location = JSON.parse(location);
            if (typeof services === 'string') services = JSON.parse(services);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid JSON format for location or services' });
        }

        // Validate coordinates if provided
        if (location && location.coordinates) {
            const [lng, lat] = location.coordinates;
            if (typeof lng !== 'number' || typeof lat !== 'number' ||
                lng < -180 || lng > 180 || lat < -90 || lat > 90) {
                return res.status(400).json({ message: 'Invalid coordinates' });
            }
        }

        const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const mechanicFields = {
            user: req.user.id,
            businessName,
            description,
            isOnline: isOnline === 'true' || isOnline === true,
            location,
            services,
            serviceRadius: Number(serviceRadius)
        };

        if (imagePaths.length > 0) {
            mechanicFields.images = imagePaths;
        }

        let mechanic = await Mechanic.findOne({ user: req.user.id });

        if (mechanic) {
            if (imagePaths.length === 0) {
                delete mechanicFields.images;
            }

            mechanic = await Mechanic.findOneAndUpdate(
                { user: req.user.id },
                { $set: mechanicFields },
                { new: true }
            );
            res.json(mechanic);
        } else {
            mechanic = await Mechanic.create(mechanicFields);
            res.status(201).json(mechanic);
        }
    });
});

// @desc    Get logged-in garage owner's mechanic profile
// @route   GET /api/mechanics/my-profile
// @access  Private (Garage Owner)
const getMyProfile = asyncHandler(async (req, res) => {
    const mechanic = await Mechanic.findOne({ user: req.user.id });

    if (!mechanic) {
        res.status(404);
        throw new Error('No mechanic profile found. Please register your garage first.');
    }

    res.json(mechanic);
});

// @desc    Toggle online/offline status
// @route   PUT /api/mechanics/toggle-online
// @access  Private (Garage Owner)
const toggleOnline = asyncHandler(async (req, res) => {
    const mechanic = await Mechanic.findOne({ user: req.user.id });

    if (!mechanic) {
        res.status(404);
        throw new Error('No mechanic profile found');
    }

    mechanic.isOnline = !mechanic.isOnline;
    await mechanic.save();

    res.json({ isOnline: mechanic.isOnline });
});

// @desc    Get nearest mechanics
// @route   GET /api/mechanics/nearest
// @access  Public
const getNearestMechanics = asyncHandler(async (req, res) => {
    const { long, lat, radius } = req.query;

    if (!long || !lat) {
        res.status(400);
        throw new Error('Please provide longitude and latitude');
    }

    const maxDistance = radius ? (parseFloat(radius) * 1000) : 10000;

    const mechanics = await Mechanic.find({
        isOnline: true,
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(long), parseFloat(lat)]
                },
                $maxDistance: maxDistance
            }
        }
    }).populate('user', 'name phone avatarUrl');

    res.json({
        count: mechanics.length,
        data: mechanics
    });
});

// @desc    Get all mechanics (with optional geo filtering)
// @route   GET /api/mechanics
// @access  Public
const getMechanics = asyncHandler(async (req, res) => {
    const { lat, lng, long, radius } = req.query;
    const longitude = lng || long;

    try {
        if (lat && longitude) {
            const maxDistance = radius ? (parseFloat(radius) * 1000) : 10000;

            const mechanics = await Mechanic.find({
                isOnline: true,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(longitude), parseFloat(lat)]
                        },
                        $maxDistance: maxDistance
                    }
                }
            }).populate('user', 'name phone avatarUrl');

            res.json(mechanics);
        } else {
            const mechanics = await Mechanic.find().populate('user', 'name phone avatarUrl');
            res.json(mechanics);
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @desc    Get mechanic by ID
// @route   GET /api/mechanics/:id
// @access  Public
const getMechanicById = asyncHandler(async (req, res) => {
    const mechanic = await Mechanic.findById(req.params.id).populate('user', 'name email phone');

    if (mechanic) {
        res.json(mechanic);
    } else {
        res.status(404);
        throw new Error('Mechanic not found');
    }
});

module.exports = {
    updateProfile,
    getMyProfile,
    toggleOnline,
    getNearestMechanics,
    getMechanics,
    getMechanicById
};
