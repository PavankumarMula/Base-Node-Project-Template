const axios = require("axios");

const { BookingRepo } = require("../repositories/index")
const { FLIGHT_SERVICE } = require("../config/server-config")
const { status } = require("../utils/enums")
const db = require("../models");

const bookingRepo = new BookingRepo();
const { BOOKED, CANCELLED } = status

class BookingService {
  constructor() {

  }

  async createBooking(data) {
    const t = await db.sequelize.transaction()
    try {
      const getFlight = await axios.get(`${FLIGHT_SERVICE}/v1/flight/${data.flightId}`);
      //const result = await bookingRepo.createBooking(data);
      const flightData = getFlight?.data?.result
      if (!flightData) {
        throw new Error("fetching flight Details failed");
      }
      if (flightData?.totalAvailbleSeats < data?.requestedSeats) {
        throw Error("Requested seats are more than available seats");
      }
      const totalAmount = flightData?.price * data.requestedSeats;
      const bookingPayload = {
        ...data,
        totalCost: totalAmount,
      }

      // we have locked those seats for lets say 15 minutes if payment is done we gonna decrease the seats if not after 15 mins we gonna release the seats
      const result = await bookingRepo.createBooking(bookingPayload, t);
      console.log("result of booking", result);
      // assuming payment is done (decrease the seats)
      await axios.patch(`${FLIGHT_SERVICE}/v1/flight/${data.flightId}`, {
        seats: data.requestedSeats,
        isDecrement: true
      });
      await t.commit()
      return result;
    } catch (error) {
      if (!t.finished) await t.rollback();
      console.log("error in service", error);
      throw error
    }
  }


  // make payments
  async makePayments(data) {
    const transaction = await db.sequelize.transaction();
    try {

      const bookingDetails = await bookingRepo.getBookings(data.bookingId, transaction);
      if (bookingDetails.status === CANCELLED) {
        throw new Error("booking already has expired")
      }
      const bookingTime = new Date(bookingDetails.createdAt);
      const timeNow = new Date();
      if (timeNow - bookingTime > 300000) {
        await this.cancelBooking(data.bookingId);
        throw new Error("Too late Booking  has expired")

      }
      if (bookingDetails.totalCost !== data.totalCost) {
        throw new Error("Amount mismatched")
      }
      if (bookingDetails.userId !== data.userId) {
        throw new Error("userId mismatched")
      }

      // we assume that payment is done we update the status of booking to BOOKED
      await bookingRepo.updateBooking(bookingDetails.id, { status: BOOKED }, transaction);
      await transaction.commit()

    } catch (error) {
      console.log("error in service", error);
      await transaction.rollback()
      throw error
    }
  }

  async cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
      const bookingDetails = await bookingRepo.getBookings(bookingId, transaction);
      if (bookingDetails.status === CANCELLED) {
        await transaction.commit();
        return
      }
      // bring back the booked seats
      await axios.patch(`${FLIGHT_SERVICE}/v1/flight/${bookingDetails.flightId}`, {
        seats: bookingDetails.requestedSeats,
        isDecrement: false
      });
      // update the seats
      await bookingRepo.updateBooking(bookingDetails.id, { status: CANCELLED }, transaction);
      transaction.commit();
    } catch (error) {
      console.log("error in service", error);
      await transaction.rollback()
      throw error
    }
  }

  async cancelOldBookings() {
    const transaction = await db.sequelize.transaction();
    try {
      // calculate time
      const time = new Date(Date.now() - 1000 * 60 * 5);

      const oldBookings = await bookingRepo.cancelOldBookings(time, transaction);
      if (!oldBookings && !Array.isArray(oldBookings)) return;
      for (const oldBooking of oldBookings) {
        // Release the seats
        await axios.patch(`${FLIGHT_SERVICE}/v1/flight/${oldBooking.flightId}`, {
          seats: oldBooking.requestedSeats,
          isDecrement: false
        });
        // update the status
        await bookingRepo.updateBooking(oldBooking.id, { status: CANCELLED }, transaction);
      }
      await transaction.commit();
      console.log(`Released seats and cancelled ${oldBookings.length} bookings.`);
      return oldBookings;


    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      console.error("Error cancelling old bookings:", error);
      throw error;
    }
  }
}

module.exports = BookingService