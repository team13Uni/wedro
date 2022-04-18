import cron from "node-cron";
import { wellnessCheck } from "../modules/weather-station/controllers";
import { downscaleData } from "../modules/measurement";

export default function () {
  cron.schedule("*/10 * * * *", async () => {
    console.log("cron every 10 minutes");
    const updatedStations = await wellnessCheck();
    console.log(updatedStations);
  });

  // every day
  cron.schedule("0 0 * * *", async () => {
    console.log("cron day");
    const data = await downscaleData("day");
    console.log(data);
  });

  // every month
  cron.schedule("0 0 1 */1 *", async () => {
    console.log("cron month");
    const data = await downscaleData("month");
    console.log(data);
  });

  // every year
  cron.schedule("0 0 0 1 */12 *", async () => {
    console.log("cron year");
    const data = await downscaleData("year");
    console.log(data);
  });
}
