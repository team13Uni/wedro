import {
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  isEqual,
  set,
} from "date-fns";
import { HttpException } from "../../exceptions";
import type { IdParam, RequestWithUser, ResponseWithError } from "../../types";
import { ErrorCode, StatusCode } from "../../types";
import { findLocationById } from "../location/model";
import {
  findWeatherStationById,
  updateWeatherStationById,
} from "../weather-station/model";
import {
  deleteMeasurementById,
  findAllMeasurements,
  findMeasurementById,
  MeasurementModel,
  updateMeasurementById,
} from "./model";
import type {
  DeleteMeasurementResponse,
  Measurement,
  MeasurementType,
} from "./types";

/**
 * Creates a new measurement
 */
export const create = async (
  req: RequestWithUser<Record<string, string>, Measurement, Measurement>,
  res: ResponseWithError<Measurement>
) => {
  try {
    const { body } = req;

    /** find location */
    const location = await findLocationById(body.locationId);
    if (!location) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: `Location doesn't exist`,
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
        },
      });
    }

    /** find weather station (redundant, remove locationId or nodeId from measurement as location-node is a 1:1 relation) */
    const weatherStation = await findWeatherStationById(body.nodeId);
    if (!weatherStation) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: `Weather station doesn't exist`,
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
        },
      });
    }

    const getInputData = () => {
      let measuredAt = new Date(body.measuredAt);

      /**
       * TODO: check if this makes sense
       * Set date-time values to 0 depending on the type of measurement.
       * This ensures that measurement with e.g. type 'hour' will be saved as "2022-05-02T18:00:00.000Z" and not "2022-05-02T18:48:44.122Z"
       */
      switch (req.body.type) {
        case "hour":
          set(measuredAt, { minutes: 0, seconds: 0, milliseconds: 0 });
          break;
        case "day":
          set(measuredAt, {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          });
          break;
        case "month":
          set(measuredAt, {
            date: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          });
          break;
        case "year":
          set(measuredAt, {
            month: 0,
            date: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          });
          break;
      }

      return {
        ...req.body,
        measuredAt,
      };
    };

    /** create and save new measurement */
    const newMeasurement = new MeasurementModel(getInputData());
    const result = await newMeasurement.save();

    /** update weather station `lastActiveAt` field */
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
    const data: GeBucketsDtoOut = buckets.map(
      (bucketDate, index, mappedBuckets) => {
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
      }
    );

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
