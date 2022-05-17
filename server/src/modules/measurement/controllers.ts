import { subHours } from "date-fns";
import type { ObjectId } from "mongoose";
import { HttpException } from "../../exceptions";
import { daysInYear, pickFrom } from "../../helpers/common";
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
  deleteMeasurementByMultipleIds,
  findAllMeasurements,
  findMeasurementById,
  MeasurementModel,
} from "./model";
import type {
  CreateMeasurementRequestBody,
  CreateMeasurementResponse,
  DeleteMeasurementResponse,
  Measurement,
  MeasurementType,
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
    // FIXME: errors are not handled
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
  nodeId: ObjectId | undefined;
};

export const downscaleData = async (
  type: Exclude<MeasurementType, "5-minutes">,
  debug?: boolean
) => {
  try {
    const now = new Date();
    let findType: MeasurementType;
    let incrementBy;

    let lastDate;
    let lastDateTime;
    let nextDate;

    const queryOptions = { sort: { measuredAt: -1 }, limit: 1 };
    const fallbackQueryOptions = { sort: { measuredAt: 1 }, limit: 1 };

    switch (type) {
      case "hour": {
        findType = "5-minutes";
        incrementBy = 60 * 60 * 1000;

        let findLastHour = await findAllMeasurements(
          { type: "hour" },
          undefined,
          queryOptions
        );

        if (findLastHour?.length === 0) {
          findLastHour = await findAllMeasurements(
            { type: "5-minutes" },
            undefined,
            fallbackQueryOptions
          );
        }

        lastDate = new Date(findLastHour[0].measuredAt);
        lastDateTime = lastDate.getTime();

        nextDate = new Date(lastDate).setHours(lastDate.getHours() + 1);

        break;
      }

      case "day": {
        findType = "hour";
        incrementBy = 24 * 60 * 60 * 1000;

        let findLastDay = await findAllMeasurements(
          { type: "day" },
          undefined,
          queryOptions
        );

        if (findLastDay?.length === 0) {
          findLastDay = await findAllMeasurements(
            { type: "hour" },
            undefined,
            fallbackQueryOptions
          );
        }

        lastDate = new Date(findLastDay[0].measuredAt);
        lastDateTime = lastDate.getTime();

        nextDate = new Date(lastDate).setDate(lastDate.getDate() + 1);

        break;
      }

      case "month": {
        findType = "day";

        let findLastMonth = await findAllMeasurements(
          { type: "month" },
          undefined,
          queryOptions
        );
        if (findLastMonth?.length === 0) {
          findLastMonth = await findAllMeasurements(
            { type: "day" },
            undefined,
            fallbackQueryOptions
          );
        }

        if (findLastMonth?.length === 0) {
          findLastMonth = await findAllMeasurements(
            { type: "hour" },
            undefined,
            fallbackQueryOptions
          );
        }

        lastDate = new Date(findLastMonth[0].measuredAt);
        lastDate.setDate(1);
        if (findLastMonth[0].type === "month") {
          lastDateTime = lastDate.setMonth(lastDate.getMonth() + 1);
        } else {
          lastDateTime = lastDate.getTime();
        }

        nextDate = new Date(lastDate).setMonth(lastDate.getMonth() + 1);

        break;
      }

      case "year": {
        findType = "month";

        let findLastYear = await findAllMeasurements(
          { type: "year" },
          undefined,
          queryOptions
        );

        if (findLastYear?.length === 0) {
          findLastYear = await findAllMeasurements(
            { type: "month" },
            undefined,
            queryOptions
          );
        }

        if (findLastYear?.length === 0) {
          findLastYear = await findAllMeasurements(
            { type: "day" },
            undefined,
            queryOptions
          );
        }

        if (findLastYear?.length === 0) {
          findLastYear = await findAllMeasurements(
            { type: "hour" },
            undefined,
            queryOptions
          );
        }

        lastDate = new Date(findLastYear[0].measuredAt);
        lastDateTime = lastDate.getTime();

        nextDate = new Date(lastDate).setFullYear(lastDate.getFullYear() + 1);

        break;
      }
    }

    const savedMeasurements = [];

    while (nextDate <= now.getTime()) {
      const stepValues = await findAllMeasurements({
        type: findType,
        measuredAt: { $gte: lastDateTime, $lte: nextDate },
      });

      let condition = stepValues.length > 1 && stepValues.length < 100;

      if (type === "hour") {
        condition = stepValues.length === 11;
      }

      if (condition) {
        let numbers: Record<string, TransformedDataType> = {};
        for (const measurement of stepValues) {
          // @ts-ignore
          const locationId = String(measurement.locationId);

          if (!numbers[locationId])
            numbers[locationId] = {
              temperature: 0,
              humidity: 0,
              numberOfMeasurements: 0,
              nodeId: undefined,
            };

          numbers[locationId].temperature += measurement.temperature;
          numbers[locationId].humidity += measurement.humidity;
          numbers[locationId].numberOfMeasurements += 1;
          numbers[locationId].nodeId = measurement.nodeId;
        }

        const keys = Object.keys(numbers);

        for (const key of keys) {
          const data = numbers[key];

          let measuredAt = new Date(nextDate);

          if (type === "day") {
            measuredAt.setHours(0);
            measuredAt.setMinutes(0);
            measuredAt.setSeconds(0);
          }

          if (type === "month") {
            measuredAt = new Date(lastDate);
            measuredAt.setHours(12);
          }

          const newMeasurement = new MeasurementModel({
            locationId: key,
            type,
            temperature: data.temperature / data.numberOfMeasurements,
            humidity: data.humidity / data.numberOfMeasurements,
            measuredAt: measuredAt.toISOString(),
            nodeId: data.nodeId,
          });

          const savedMeasurement = await newMeasurement.save();
          savedMeasurements.push(savedMeasurement);
        }
      }

      // Remove all saved and unsaved 5-minutes measurements
      if (findType === "5-minutes" && condition) {
        await deleteMeasurementByMultipleIds(
          // @ts-ignore
          stepValues.map((value) => String(value._id))
        );
      }

      lastDateTime = nextDate;

      switch (type) {
        case "hour":
        case "day":
          // @ts-ignore
          nextDate += incrementBy;
          break;

        case "month": {
          const nextDateDate = new Date(nextDate);

          const numberOfDays = new Date(
            nextDateDate.getFullYear(),
            nextDateDate.getMonth() + 1,
            0
          ).getDate();

          nextDate += numberOfDays * 24 * 60 * 60 * 1000;
          break;
        }
        case "year": {
          const nextDateDate = new Date(nextDate);

          const numberOfDays = daysInYear(nextDateDate.getFullYear() + 1);

          nextDate += numberOfDays * 24 * 60 * 60 * 1000;
        }
      }
    }

    console.log(savedMeasurements);
  } catch (err) {
    throw err;
  }
};

const tenHours = 600;

export const upscaleData = (
  timeFrom: number,
  timeTo: number,
  lowValue: number,
  highValue: number,
  byMinutes: number
) => {
  const delta = timeTo - timeFrom;

  if (delta > tenHours && byMinutes < 5) return [];

  let step = timeFrom + byMinutes * 60;
  const result = [];

  while (step < timeTo) {
    const stepResult =
      lowValue +
      (step - timeFrom) * ((highValue - lowValue) / (timeTo - timeFrom));

    const date = new Date(step);

    result.push({ value: stepResult, measuredAt: date.toISOString() });

    step += byMinutes * 60;
  }

  return result;
};

/**
 * Returns buckets with temperature and humidity data for specified date range and granularity (type)
 */
export const getBuckets = async (
  req: RequestWithUser<
    { locationId: string },
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
      locationId: req.params.locationId,
    });

    res.json(buckets);
  } catch (err: HttpException | any) {
    res.status(err?.status ?? 500).json({
      error: {
        message: err?.message || "Unknown error",
        status: StatusCode.SERVER_ERROR,
        code: ErrorCode.SERVER_ERROR,
      },
    });
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
  req: RequestWithUser<{ locationId: string }, GetCurrentDtoOut, never, never>,
  res: ResponseWithError<GetCurrentDtoOut>
) => {
  try {
    /** find most recent weather station measurement */
    const measurement = await MeasurementModel.findOne({
      locationId: req.params.locationId,
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
      locationId: req.params.locationId,
    });

    // @ts-ignore
    res.json({
      date: measurement.measuredAt.toISOString(),
      // @ts-ignore
      ...pickFrom(measurement.toJSON(), "temperature", "humidity"),
      todayBuckets,
    });
  } catch (err: HttpException | any) {
    res.status(err?.status ?? 500).json({
      error: {
        message: err?.message || "Unknown error",
        status: StatusCode.SERVER_ERROR,
        code: ErrorCode.SERVER_ERROR,
      },
    });
  }
};
type GetCurrentDtoOut = {
  date: string;
  temperature: number | null;
  humidity: number | null;
  todayBuckets: GetBucketsDtoOut;
};
