import type { ObjectId } from "mongoose";

export type Location = {
  id?: ObjectId;
  name: string;
  nodeId: ObjectId;
  state: "active" | "inactive";
  coordinates: number[];
  seaLevel: number;
};

export type CreateLocationRequestBody = {
  name: Location["name"];
  nodeId: Location["nodeId"];
  state?: Location["state"];
  coordinates?: Location["coordinates"];
  seaLevel?: Location["seaLevel"];
};

export type DeleteLocationResponse = {
  success: boolean;
};
