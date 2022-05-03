import {
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  isEqual,
} from "date-fns";
import { ErrorCode, RequestWithNodeId, StatusCode } from "../../types";
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
} from "./model";
import { HttpException } from "../../exceptions";
import {
  findWeatherStationById,
  updateWeatherStationById,
} from "../weather-station/model";
import type { CreateMeasurementRequestBody } from "./types";
import { findLocationByNodeId } from "../location/model";

export const create = async (
  req: RequestWithNodeId<
    Record<string, string>,
    undefined,
    CreateMeasurementRequestBody
  >,
  res: ResponseWithError<{ success: boolean }>
) => {
  try {
    const { body } = req;

    if (!req.nodeId) return res.json({ success: false });

    const location = await findLocationByNodeId(req.nodeId);

    for (const bodyItem of body) {
      const weatherStation = await findWeatherStationById(req.nodeId);

      if (!weatherStation) {
        return res.status(StatusCode.RECORD_NOT_FOUND).json({
          success: false,
          error: {
            message: "Weather station doesn't exist",
            status: StatusCode.RECORD_NOT_FOUND,
            code: ErrorCode.NOT_FOUND,
          },
        });
      }

      const date = new Date(bodyItem.measuredAt);

      const newMeasurement = new MeasurementModel({
        ...bodyItem,
        type: "hour",
        nodeId: req.nodeId,
        locationId: location ? location.id : undefined,
        measuredAt: date.toISOString(),
      });
      await newMeasurement.save();
    }

    const lastActiveAtDate = new Date(body[body.length - 1].measuredAt);

    await updateWeatherStationById(req.nodeId, {
      lastActiveAt: lastActiveAtDate,
    });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(err.status).json({
        success: false,
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    } else {
      res.status(StatusCode.SERVER_ERROR).json({ success: false });
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
      // @ts-ignore
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

/**
 * Returns buckets with temperature and humidity data for specified date range and granularity (type)
 */
export const getBuckets = async (
  req: RequestWithUser<
    { weatherStationId: string },
    GeBucketsDtoOut,
    never,
    { dateFrom: string; dateTo: string; type: MeasurementType }
  >,
  res: ResponseWithError<GeBucketsDtoOut>
) => {
  try {
    const dateFrom = new Date(req.query.dateFrom);
    const dateTo = new Date(req.query.dateTo);
    const measurements = await MeasurementModel.find({
      nodeId: req.params.weatherStationId,
      measuredAt: { $gte: dateFrom, $lte: dateTo },
      type: req.query.type,
    });

    let buckets = [];
    switch (req.query.type) {
      case "hour":
        buckets = eachHourOfInterval({ start: dateFrom, end: dateTo });
        break;
      case "day":
        buckets = eachDayOfInterval({ start: dateFrom, end: dateTo });
        break;
      case "month":
        buckets = eachMonthOfInterval({ start: dateFrom, end: dateTo });
        break;
      case "year":
        buckets = eachYearOfInterval({ start: dateFrom, end: dateTo });
        break;
    }

    /** map or fill empty buckets */
    const data: GeBucketsDtoOut = buckets.map((bucketDate) => {
      const measurement = measurements.find((m) =>
        isEqual(new Date(m.toJSON().measuredAt), bucketDate)
      );

      /** no measurement for the bucket, return empty bucket */
      if (!measurement) {
        return {
          date: bucketDate.toISOString(),
          /** TODO: calculate data instead of returning empty buckets */
          temperature: 0,
          humidity: 0,
        };
      }

      return {
        date: bucketDate.toISOString(),
        temperature: measurement.temperature,
        humidity: measurement.humidity,
      };
    });

    /** send the data */
    res.send(data);
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
type GeBucketsDtoOut = Array<{
  date: string;
  temperature: number;
  humidity: number;
}>;
