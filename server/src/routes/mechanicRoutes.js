const express = require('express');
const router = express.Router();
const {
    updateProfile,
    getMyProfile,
    toggleOnline,
    getNearestMechanics,
    getMechanics,
    getMechanicById
} = require('../controllers/mechanicController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Garage Owner', 'Admin'), updateProfile)
    .get(getMechanics);

// Garage Owner specific routes (must be before /:id)
router.get('/my-profile', protect, authorize('Garage Owner'), getMyProfile);
router.put('/toggle-online', protect, authorize('Garage Owner'), toggleOnline);
router.get('/nearest', getNearestMechanics);

router.get('/:id', getMechanicById);

module.exports = router;
