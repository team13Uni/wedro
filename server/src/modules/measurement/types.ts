import type { ObjectId } from "mongoose";

export type MeasurementType = "hour" | "day" | "month" | "year";

export type Measurement = {
  temperature: number;
  humidity: number;
  measuredAt: Date;
  nodeId: ObjectId;
  type: MeasurementType;
};

export type CreateMeasurementRequestBody = Array<{
  temperature: number;
  humidity: number;
  measuredAt: number;
}>;

export type DeleteMeasurementResponse = {
  success: boolean;
};
