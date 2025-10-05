const express = require('express');

const { BookingController } = require('../../controllers');

const router = express.Router();

router.post('/create', BookingController.createBooking);

module.exports = router;