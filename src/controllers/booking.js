const {BookingService} =require("../services/index");
const { SuccessResponse, ErrorResponse } = require("../utils/response");

const bookingServcie = new BookingService();


const createBooking = async (req, res) => {
  console.log("reqBody",req.body);
  try {
    const result = await bookingServcie.createBooking(req.body);
    SuccessResponse.result = result;
    SuccessResponse.message = "Airplane Creation Successfull";
    return res.json(SuccessResponse);
  } catch (error) {
    console.log("error in controller", error)
    ErrorResponse.error = error;
    ErrorResponse.message = "Airplane Creation is Failed";
    res.json(ErrorResponse);
  }
}


module.exports={
    createBooking
}
