import type { ObjectId } from "mongoose";

export type WeatherStation = {
  id: ObjectId;
  name: string;
  secret: string;
  unavailable: boolean;
  active: boolean;
  lastActiveAt: Date;
};

export type CreateWeatherStationRequestBody = {
  name: WeatherStation["name"];
  secret: WeatherStation["secret"];
  unavailable?: WeatherStation["unavailable"];
  active?: WeatherStation["active"];
  lastActiveAt?: WeatherStation["lastActiveAt"];
};

export type DeleteWeatherStationResponse = {
  success: boolean;
};

export type AuthorizeWeatherStationBody = {
  secret: string;
};

export type AuthorizeWeatherStationResponse = {
  token: string;
};
