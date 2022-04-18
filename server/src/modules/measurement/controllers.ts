import { ErrorCode, StatusCode } from "../../types";
import type { IdParam, RequestWithUser, ResponseWithError } from "../../types";
import type {
  DeleteMeasurementResponse,
  Measurement,
  MeasurementType,
} from "./types";
import {
  deleteMeasurementById,
  findAllMeasurements,
  findMeasurementById,
  MeasurementModel,
  updateMeasurementById,
} from "./model";
import { HttpException } from "../../exceptions";
import { findLocationById } from "../location/model";
import {
  findWeatherStationById,
  updateWeatherStationById,
} from "../weather-station/model";

export const create = async (
  req: RequestWithUser<Record<string, string>, Measurement, Measurement>,
  res: ResponseWithError<Measurement>
) => {
  try {
    const { body } = req;

    const location = await findLocationById(body.locationId);
    const weatherStation = await findWeatherStationById(body.nodeId);

    if (!location || !weatherStation) {
      let doesntExist = "";

      if (!location && weatherStation) doesntExist = "Location";
      if (location && !weatherStation) doesntExist = "Weather station";
      if (!location && !weatherStation)
        doesntExist = "Location and weather station";

      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: `${doesntExist} doesn't exist`,
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
        },
      });
    }

    const newMeasurement = new MeasurementModel(req.body);
    const result = await newMeasurement.save();

    await updateWeatherStationById(body.nodeId, {
      lastActiveAt: body.measuredAt,
    });

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

export const update = async (
  req: RequestWithUser<IdParam, Measurement, Partial<Measurement>>,
  res: ResponseWithError<Measurement>
) => {
  try {
    const { id } = req.params;

    const measurement = await findMeasurementById(id);

    if (!measurement) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: "Measurement not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    const updatedMeasurement = await updateMeasurementById(id, req.body);

    if (!updatedMeasurement) {
      return res.status(StatusCode.SERVER_ERROR).json({
        error: {
          message:
            "Error occurred when updating the measurement, please try again later",
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    res.send(updatedMeasurement);
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
    Measurement[],
    Partial<Measurement>
  >,
  res: ResponseWithError<Measurement[]>
) => {
  try {
    const measurements = await findAllMeasurements(req.body);
    res.send(measurements);
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

export const findOne = async (
  req: RequestWithUser<IdParam, Measurement, undefined>,
  res: ResponseWithError<Measurement>
) => {
  try {
    const measurement = await findMeasurementById(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        error: {
          message: "Measurement not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
        },
      });
    }

    res.send(measurement);
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

export const deleteMeasurement = async (
  req: RequestWithUser<IdParam, DeleteMeasurementResponse, undefined>,
  res: ResponseWithError<DeleteMeasurementResponse>
) => {
  try {
    const { id } = req.params;

    const measurement = await findMeasurementById(id);

    if (!measurement) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: "Measurement not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    const deletedMeasurement = await deleteMeasurementById(id);

    if (!deletedMeasurement) {
      return res.status(StatusCode.SERVER_ERROR).json({
        error: {
          message:
            "Error occurred when deleting the measurement, please try again later",
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

type TransformedDataType = {
  temperature: number;
  humidity: number;
  numberOfMeasurements: number;
};

export const downscaleData = async (type: Exclude<MeasurementType, "hour">) => {
  try {
    const now = new Date();
    const minDate = new Date();
    let min;
    let findType: MeasurementType;

    switch (type) {
      case "day": {
        minDate.setDate(now.getDate() - 1);
        min = minDate.toISOString();
        findType = "hour";

        break;
      }
      case "month": {
        minDate.setMonth(now.getMonth() - 1);
        min = minDate.toISOString();
        findType = "day";

        break;
      }
      case "year":
        minDate.setFullYear(now.getFullYear() - 1);
        min = minDate.toISOString();
        findType = "month";

        break;
    }

    const measurements = await findAllMeasurements({
      measuredAt: { $lte: min, $gte: now.toISOString() },
      type,
    });

    let numbers: Record<string, TransformedDataType> = {};
    for (const measurement of measurements) {
      const locationId = String(measurement.locationId);

      if (!numbers[locationId])
        numbers[locationId] = {
          temperature: 0,
          humidity: 0,
          numberOfMeasurements: 0,
        };

      numbers[locationId].temperature += measurement.temperature;
      numbers[locationId].humidity += measurement.humidity;
      numbers[locationId].numberOfMeasurements += 1;
    }

    const keys = Object.keys(numbers);
    const savedMeasurements = [];

    for (const key of keys) {
      const data = numbers[key];

      const newMeasurement = new MeasurementModel({
        locationId: key,
        type,
        temperature: data.temperature / data.numberOfMeasurements,
        humidity: data.humidity / data.numberOfMeasurements,
        measuredAt: now.toISOString(),
      });
      const savedMeasurement = await newMeasurement.save();
      savedMeasurements.push(savedMeasurement);
    }

    return savedMeasurements;
  } catch (err) {
    throw err;
  }
};
