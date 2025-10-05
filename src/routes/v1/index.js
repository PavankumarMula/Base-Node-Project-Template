const express = require('express');
const booking = require("./booking")

const router = express.Router();

router.use('/bookings', booking);



module.exports = router;