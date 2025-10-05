const axios  = require("axios");

const {BookingRepo} = require("../repositories/index")
const {FLIGHT_SERVICE} = require("../config/server-config")
const db = require("../models");

const bookingRepo = new BookingRepo();

class BookingService{
    constructor(){

    }

    async createBooking(data){
        const t = await db.sequelize.transaction()
        try {
            const getFlight = await axios.get(`${FLIGHT_SERVICE}/v1/flight/${data.flightId}`);
            //const result = await bookingRepo.createBooking(data);
            const flightData = getFlight?.data?.result
          if(!flightData) {
            throw new Error("fetching flight Details failed");
          }
          if(flightData?.totalAvailbleSeats<data?.requestedSeats){
            throw Error("Requested seats are more than available seats");
          }
          const totalAmount = flightData?.price * data.requestedSeats;
          const bookingPayload = {
            ...data,
            totalCost:totalAmount,
          }

          // we have locked those seats for lets say 15 minutes if payment is done we gonna decrease the seats if not after 15 mins we gonna release the seats
          const result = await bookingRepo.createBooking(bookingPayload,t);
          console.log("result of booking",result);
          // assuming payment is done (decrease the seats)
          await axios.patch(`${FLIGHT_SERVICE}/v1/flight/${data.flightId}`,{
            seats:data.requestedSeats,
            isDecrement:true
          });
          await t.commit()
          return result;
        } catch (error) {
            if(!t.finished) await t.rollback();
            console.log("error in service",error);
            throw error
        }
    }
}

module.exports = BookingService