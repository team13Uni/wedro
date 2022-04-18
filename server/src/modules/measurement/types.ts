import type { ObjectId } from "mongoose";

export type MeasurementType = "hour" | "day" | "month" | "year";

export type Measurement = {
  temperature: number;
  humidity: number;
  measuredAt: string;
  nodeId: ObjectId;
  locationId: ObjectId;
  type: MeasurementType;
};

export type DeleteMeasurementResponse = {
  success: boolean;
};