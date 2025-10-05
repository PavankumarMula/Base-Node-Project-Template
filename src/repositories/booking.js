const {Booking}= require("../models");

class BookingRepo{
    constructor(){

    }
   async  createBooking(data,transaction){
            try {
                const result = await Booking.create(data,{transaction:transaction});
                return result
            } catch (error) {
                console.log("error in repo booking",error);
                throw error;
            }
    }
}

module.exports = BookingRepo;