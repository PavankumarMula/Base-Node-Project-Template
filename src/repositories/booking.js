
const { Op } = require("sequelize");
const { Booking } = require("../models");
const { status } = require("../utils/enums");
const { BOOKED, CANCELLED } = status

class BookingRepo {
    constructor() {

    }
    async createBooking(data, transaction) {
        try {
            const result = await Booking.create(data, { transaction: transaction });
            return result
        } catch (error) {
            console.log("error in repo booking", error);
            throw error;
        }
    }

    async getBookings(bookingId, transaction) {
        try {
            const booking = await Booking.findByPk(bookingId, { transaction });
            return booking
        } catch (error) {
            console.log("error in repo", error)
            throw error;
        }
    }

    async updateBooking(id, data, transaction) {
        try {
            const result = await Booking.update(
                data,
                {
                    where: { id: id },
                    transaction
                }
            );
            return result;
        } catch (error) {
            console.error("Error in updateBooking:", error);
            throw error;
        }
    }

    async cancelOldBookings(timeStamp,transaction) {
        const response = await Booking.findAll( {
            where: {
                createdAt: { [Op.lt]: timeStamp },
                status: { [Op.notIn]: [BOOKED, CANCELLED] }
            }
        },{transaction});
        return response;
    }

}

module.exports = BookingRepo;