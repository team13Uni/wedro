import { subHours } from "date-fns";
import { HttpException } from "../../exceptions";
import { pickFrom } from "../../helpers/common";
import type { IdParam, RequestWithUser, ResponseWithError } from "../../types";
import { ErrorCode, RequestWithNodeId, StatusCode } from "../../types";
import { findLocationByNodeId } from "../location/model";
import {
  findWeatherStationById,
  updateWeatherStationById,
} from "../weather-station/model";
import { BucketGranularity, getBucketsForStation } from "./helpers";
import {
  deleteMeasurementById,
  findAllMeasurements,
  findMeasurementById,
  MeasurementModel,
} from "./model";
import type {
  CreateMeasurementRequestBody,
  CreateMeasurementResponse,
  DeleteMeasurementResponse,
  Measurement,
} from "./types";

/**
 * Creates a new measurement.
 */
export const create = async (
  req: RequestWithNodeId<
    Record<string, string>,
    undefined,
    CreateMeasurementRequestBody
  >,
  res: ResponseWithError<CreateMeasurementResponse>
) => {
  try {
    const { body } = req;

    if (!req.nodeId) return res.status(StatusCode.NOT_AUTHORIZED);

    const location = await findLocationByNodeId(req.nodeId);

    for (const bodyItem of body) {
      const weatherStation = await findWeatherStationById(req.nodeId);

      if (!weatherStation) {
        return res.status(StatusCode.RECORD_NOT_FOUND).json({
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
        type: "5-minutes",
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

    const lastSentItem = body[body.length - 1];

    res.json(lastSentItem);
  } catch (err) {
    if (err instanceof HttpException) {
      res.status(err.status).json({
        error: {
          message: err.message,
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    } else {
      res.status(StatusCode.SERVER_ERROR);
    }
  }
};

/**
 * Returns all measurements
 */
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

/**
 * Returns one measurement by its ID
 */
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

/**
 * Deletes a measurement
 */
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

/**
 * Returns buckets with temperature and humidity data for specified date range and granularity (type)
 */
export const getBuckets = async (
  req: RequestWithUser<
    { weatherStationId: string },
    GetBucketsDtoOut,
    never,
    { dateFrom: string; dateTo: string; type: BucketGranularity }
  >,
  res: ResponseWithError<GetBucketsDtoOut>
) => {
  try {
    const dateFrom = new Date(req.query.dateFrom);
    const dateTo = new Date(req.query.dateTo);

    /** get buckets */
    const buckets = await getBucketsForStation({
      dateFrom,
      dateTo,
      granularity: req.query.type,
      weatherStationId: req.params.weatherStationId,
    });

    res.json(buckets);
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
type GetBucketsDtoOut = Array<{
  date: Date;
  temperature: number | null;
  humidity: number | null;
}>;

/**
 * Returns current (last measured) temperature and humidity for specified weather station
 */
export const getCurrent = async (
  req: RequestWithUser<
    { weatherStationId: string },
    GetCurrentDtoOut,
    never,
    never
  >,
  res: ResponseWithError<GetCurrentDtoOut>
) => {
  try {
    /** find most recent weather station measurement */
    const measurement = await MeasurementModel.findOne({
      nodeId: req.params.weatherStationId,
    }).sort({ measuredAt: -1 });

    /** return null as data since no measurement for the given weather station was found */
    if (!measurement) {
      return res.json({
        date: new Date().toISOString(),
        temperature: null,
        humidity: null,
        todayBuckets: [],
      });
    }

    /** find today's highs/lows from buckets */
    const now = new Date();
    const todayBuckets = await getBucketsForStation({
      dateFrom: subHours(now, 24),
      dateTo: now,
      granularity: "hour",
      weatherStationId: req.params.weatherStationId,
    });

    res.json({
      date: measurement.measuredAt.toISOString(),
      ...pickFrom(measurement.toJSON(), "temperature", "humidity"),
      todayBuckets,
    });
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
type GetCurrentDtoOut = {
  date: string;
  temperature: number | null;
  humidity: number | null;
  todayBuckets: GetBucketsDtoOut;
};
