import { FilterQuery, model, Model, Schema } from "mongoose";
import { Types } from "mongoose";
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
    enum: ["hour", "day", "month", "year"],
  },
  nodeId: {
    type: Types.ObjectId,
    ref: "weather-station",
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
