const { CronJob } = require("cron");
const {BookingService} = require("../services/index")

const bookingService = new BookingService();

const scheduleCron = () => {
  const job = new CronJob('*/5 * * * * *', () => {
   bookingService.cancelOldBookings();
  });
  job.start();
};

module.exports = { scheduleCron };
