import { model, Schema } from "mongoose";
import type { ObjectId, FilterQuery } from "mongoose";
import { WeatherStation } from "./types";

/** TODO: move elsewhere? */
const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

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
    type: Date,
  },
  seaLevel: {
    type: Number,
    required: true,
  },
  // @ts-ignore
  location: {
    type: pointSchema as any,
    required: true
  }
});

export const WeatherStationModel = model<WeatherStation>(
  "weather-station",
  weatherStationSchema
);

export const updateWeatherStationById = async (
  id: string | ObjectId,
  updateBody: Partial<WeatherStation>,
  options?: object
) =>
  await WeatherStationModel.findByIdAndUpdate(id, updateBody, options).select(
    "-secret"
  );

export const findWeatherStationById = async (id: string | ObjectId) =>
  await WeatherStationModel.findById<WeatherStation>(id).select("-secret");

export const findWeatherStationBySecret = async (secret: string) =>
    await WeatherStationModel.findOne({ secret });

export const findAllWeatherStations = async (
  filter: FilterQuery<WeatherStation>
) => await WeatherStationModel.find<WeatherStation>(filter).select("-secret");

export const deleteWeatherStationById = async (id: string) =>
  await WeatherStationModel.findByIdAndDelete(id);
