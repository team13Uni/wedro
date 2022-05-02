import type {
  AuthorizeWeatherStationBody,
  AuthorizeWeatherStationResponse,
  CreateWeatherStationRequestBody,
  DeleteWeatherStationResponse,
  WeatherStation,
} from "./types";
import type { IdParam, RequestWithUser, ResponseWithError } from "../../types";
import { ErrorCode, StatusCode } from "../../types";
import {
  deleteWeatherStationById,
  findAllWeatherStations,
  findWeatherStationById,
  findWeatherStationBySecret,
  updateWeatherStationById,
  WeatherStationModel,
} from "./model";
import { HttpException } from "../../exceptions";
import { sign } from "jsonwebtoken";

export const create = async (
  req: RequestWithUser<
    Record<string, string>,
    WeatherStation,
    CreateWeatherStationRequestBody
  >,
  res: ResponseWithError<WeatherStation>
) => {
  try {
    const newWeatherStation = new WeatherStationModel(req.body);
    const result = await newWeatherStation.save();
    res.json(result);
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(err.status).json({
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }
  }
};

export const findAll = async (
  req: RequestWithUser<
    Record<string, string>,
    WeatherStation[],
    Partial<WeatherStation>
  >,
  res: ResponseWithError<WeatherStation[]>
) => {
  try {
    const locations = await findAllWeatherStations(req.body);
    res.send(locations);
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(500).json({
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    } else {
      throw err;
    }
  }
};

export const findOne = async (
  req: RequestWithUser<IdParam, WeatherStation, undefined>,
  res: ResponseWithError<WeatherStation>
) => {
  try {
    const location = await findWeatherStationById(req.params.id);

    if (!location) {
      return res.status(404).json({
        error: {
          message: "Weather station not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
        },
      });
    }

    res.send(location);
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(500).json({
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }
  }
};

export const update = async (
  req: RequestWithUser<IdParam, WeatherStation, Partial<WeatherStation>>,
  res: ResponseWithError<WeatherStation>
) => {
  try {
    const { id } = req.params;

    const station = await findWeatherStationById(id);

    if (!station) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: "Weather station not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    const updatedStation = await updateWeatherStationById(id, req.body);

    if (!updatedStation) {
      return res.status(StatusCode.SERVER_ERROR).json({
        error: {
          message:
            "Error occurred when updating the weather station, please try again later",
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    res.send(updatedStation);
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(err.status).json({
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }
  }
};

export const deleteWeatherStation = async (
  req: RequestWithUser<IdParam, DeleteWeatherStationResponse, undefined>,
  res: ResponseWithError<DeleteWeatherStationResponse>
) => {
  try {
    const { id } = req.params;

    const station = await findWeatherStationById(id);

    if (!station) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: "Weather station not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    const deletedStation = await deleteWeatherStationById(id);

    if (!deletedStation) {
      return res.status(StatusCode.SERVER_ERROR).json({
        error: {
          message:
            "Error occurred when deleting the weather station, please try again later",
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    res.send({ success: true });
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(err.status).json({
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }
  }
};

export const authorizeWeatherStation = async (
  req: RequestWithUser<
    Record<string, string>,
    AuthorizeWeatherStationResponse,
    AuthorizeWeatherStationBody
  >,
  res: ResponseWithError<AuthorizeWeatherStationResponse>
) => {
  try {
    const { secret } = req.body;

    const station = await findWeatherStationBySecret(secret);

    if (station) {
      const token = sign(
        { nodeId: station.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: 120, // in two hours
        }
      );

      return res.status(200).json({
        token,
      });
    } else {
      res.status(400).json({
        error: {
          message: "You either send a wrong code or the station doesn't exist",
          status: StatusCode.WRONG_INPUT,
          code: ErrorCode.BAD_REQUEST,
        },
      });
    }
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(err.status).json({
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }
    throw err;
  }
};

export const wellnessCheck = async () => {
  try {
    const now = new Date();
    const nowBefore10m = new Date();
    nowBefore10m.setMinutes(now.getMinutes() - 10);

    const rottenStations = await findAllWeatherStations({
      active: true,
      unavailable: false,
      lastActiveAt: {
        $lte: nowBefore10m.toISOString(),
      },
    });

    let updatedStations = [];
    for (const station of rottenStations) {
      await updateWeatherStationById(station.id, {
        active: false,
        unavailable: true,
      });

      updatedStations.push(station);
    }

    return updatedStations;
  } catch (err) {
    throw err;
  }
};
