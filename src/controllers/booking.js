const {BookingService} =require("../services/index");
const { SuccessResponse, ErrorResponse } = require("../utils/response");

const bookingServcie = new BookingService();


const createBooking = async (req, res) => {
  console.log("reqBody",req.body);
  try {
    const result = await bookingServcie.createBooking(req.body);
    SuccessResponse.result = result;
    SuccessResponse.message = "Booking is Successfull";
    return res.json(SuccessResponse);
  } catch (error) {
    console.log("error in controller", error)
    ErrorResponse.error = error;
    ErrorResponse.message = "Booking Creation is Failed";
    res.json(ErrorResponse);
  }
}

const makePayments = async (req, res) => {
  try {
    const result = await bookingServcie.makePayments(req.body);
    SuccessResponse.result = result;
    SuccessResponse.message = "payment is Successfull";
    return res.json(SuccessResponse);
  } catch (error) {
    console.log("error in controller", error)
    ErrorResponse.error = error;
    ErrorResponse.message = "payment is failed";
    res.json(ErrorResponse);
  }
}


module.exports={
    createBooking,
    makePayments
}
