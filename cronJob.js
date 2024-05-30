import cron from "node-cron";

cron.schedule('0 0 */6 * * *', () => {
    console.log('running a task every minute');
});