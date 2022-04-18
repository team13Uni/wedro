import { model, Schema } from "mongoose";
import type { ObjectId, FilterQuery } from "mongoose";
import { WeatherStation } from "./types";

export const weatherStationSchema = new Schema<WeatherStation>({
  name: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  unavailable: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  lastActiveAt: {
    type: String,
  },
});

export const WeatherStationModel = model<WeatherStation>(
  "weather-station",
  weatherStationSchema
);

export const updateWeatherStationById = async (
  id: string | ObjectId,
  updateBody: Partial<WeatherStation>,
  options?: object
) => await WeatherStationModel.findByIdAndUpdate(id, updateBody, options);

export const findWeatherStationById = async (id: string | ObjectId) =>
  await WeatherStationModel.findById(id);

export const findAllWeatherStations = async (
  filter: FilterQuery<WeatherStation>
) => await WeatherStationModel.find<WeatherStation>(filter);

export const deleteWeatherStationById = async (id: string) =>
  await WeatherStationModel.findByIdAndDelete(id);
