import type { ObjectId } from "mongoose";

export type MeasurementType = "5-minutes" | "hour" | "day" | "month" | "year";

export type Measurement = {
  temperature: number;
  humidity: number;
  measuredAt: Date;
  nodeId: ObjectId;
  locationId: ObjectId;
  type: MeasurementType;
};

type RequestMeasurement = {
  temperature: number;
  humidity: number;
  measuredAt: number;
};

export type CreateMeasurementRequestBody = Array<RequestMeasurement>;

export type CreateMeasurementResponse = RequestMeasurement;

export type DeleteMeasurementResponse = {
  success: boolean;
};
