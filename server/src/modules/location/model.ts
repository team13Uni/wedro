import { model, Schema, Types } from "mongoose";
import type { ObjectId } from "mongoose";
import type { Location } from "./types";

export const locationSchema = new Schema<Location>({
  name: {
    type: String,
    required: true,
  },
  nodeId: {
    type: Types.ObjectId,
    ref: "weather-station",
  },
  state: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
});

export const LocationModel = model<Location>("location", locationSchema);

export const findLocationById = async (id: ObjectId | string) =>
  await LocationModel.findById<Location>(id);

export const findLocationByNodeId = async (nodeId: ObjectId | string) =>
  await LocationModel.findOne<Location>({ nodeId });

export const updateLocationById = async (
  id: ObjectId | string,
  updateBody: Partial<Location>
) => await LocationModel.findByIdAndUpdate(id, updateBody);

export const findAllLocations = async (filter: Partial<Location>) =>
  await LocationModel.find<Location>(filter);

export const deleteLocationById = async (id: string) =>
  await LocationModel.findByIdAndDelete(id);
