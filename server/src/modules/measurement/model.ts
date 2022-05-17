import { FilterQuery, model, Schema, Types } from "mongoose";
import type { Measurement } from "./types";

export const measurementSchema = new Schema<Measurement>({
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  measuredAt: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["5-minutes", "hour", "day", "month", "year"],
  },
  nodeId: {
    type: Types.ObjectId,
    required: true,
    ref: "weather-station",
  },
  locationId: {
    type: Types.ObjectId,
    required: true,
    ref: "location",
  },
});

export const MeasurementModel = model<Measurement>(
  "measurement",
  measurementSchema
);

export const findMeasurementById = async (id: string) =>
  await MeasurementModel.findById<Measurement>(id);

export const updateMeasurementById = async (
  id: string,
  updateBody: FilterQuery<Measurement>
) => await MeasurementModel.findByIdAndUpdate(id, updateBody);

export const findAllMeasurements = async (filter: FilterQuery<Measurement>) =>
  await MeasurementModel.find<Measurement>(filter);

export const deleteMeasurementById = async (id: string) =>
  await MeasurementModel.findByIdAndDelete(id);
