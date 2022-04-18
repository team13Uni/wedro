import type { ObjectId } from "mongoose";

export type Location = {
  id?: ObjectId;
  name: string;
  nodeId: ObjectId;
  state: "active" | "inactive";
};

export type CreateLocationRequestBody = {
  name: Location["name"];
  nodeId: Location["nodeId"];
  state?: Location["state"];
};

export type DeleteLocationResponse = {
  success: boolean;
};
