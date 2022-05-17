import {
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  isEqual,
} from "date-fns";
import { isDefined, sortBy } from "../../helpers/common";
import { findAllMeasurements, MeasurementModel } from "./model";
import { MeasurementType } from "./types";

/**
 * Upscale data between buckets
 * @param {BucketData & {type: MeasurementType}} leftBucket
 * @param {BucketData & {type: MeasurementType}} rightBucket
 * @param {"minute" | "5-minutes" | "hour" | "day" | "month"} granularity
 * @returns {BucketData[]}
 */
const upscaleDataBetweenBuckets = ({
  leftBucket,
  rightBucket,
  granularity,
}: UpscaleDataBetweenBucketsOptions): BucketData[] => {
  /** granularity of time `minute` and `5-minutes` are currently supported for data up scaling */
  if (!(["minute", "5-minutes"] as BucketGranularity[]).includes(granularity)) {
    return [leftBucket, rightBucket];
  }

  /** check measurement type equality */
  if (leftBucket.type !== rightBucket.type)
    throw new Error("Buckets must have the same type");

  /** check required data */
  // if (!isDefined(rightBucket.humidity) || !isDefined(rightBucket.temperature))
  //   throw new Error("Right bucket must have temperature and humidity.");

  const result: BucketData[] = [];
  const minuteStep = granularity === "5-minutes" ? 5 : 1;

  /** calculate deltaMinutes value between the dates */
  const TEN_HOURS = 10 * 60;
  const leftDateTime = leftBucket.date.getTime() / (60 * 1000);
  const rightDateTime = rightBucket.date.getTime() / (60 * 1000);
  const deltaMinutes = rightDateTime - leftDateTime;

  /** check for compatibility */
  if (deltaMinutes > TEN_HOURS && minuteStep < 5)
    throw new Error(
      "Cannot upscale data between buckets. The range is too wide and granularity is too small."
    );

  /** calculate values for each step */
  let step = leftDateTime + minuteStep;
  while (step < rightDateTime) {
    const temperatureStepRes =
      isDefined(leftBucket.temperature) && isDefined(rightBucket.temperature)
        ? leftBucket.temperature +
          (step - leftDateTime) *
            ((rightBucket.temperature - leftBucket.temperature) /
              (rightDateTime - leftDateTime))
        : null;
    const humidityStepRes =
      isDefined(leftBucket.humidity) && isDefined(rightBucket.humidity)
        ? leftBucket.humidity +
          (step - leftDateTime) *
            ((rightBucket.humidity - leftBucket.humidity) /
              (rightDateTime - leftDateTime))
        : null;

    result.push({
      humidity: humidityStepRes,
      temperature: temperatureStepRes,
      date: new Date(step * 60 * 1000),
      isCalculated: true,
    });
    step += minuteStep;
  }

  return result;
};

/**
 * Bucket data
 * @export
 */
export type BucketData = {
  date: Date;
  temperature: number | null;
  humidity: number | null;
  isCalculated?: boolean;
};

/**
 * Options type for upscaleDataBetweenBuckets function
 * @export
 */
export type UpscaleDataBetweenBucketsOptions = {
  leftBucket: BucketData & { type: MeasurementType };
  rightBucket: BucketData & { type: MeasurementType };
  granularity: BucketGranularity;
};

/**
 * Supported granularity types
 * @export
 */
export type BucketGranularity =
  | "minute"
  | "5-minutes"
  | "hour"
  | "day"
  | "month";

/**
 * Returns measurement type based on the specified granularity
 * @param {BucketGranularity} granularity
 * @returns {[MeasurementType, boolean]}
 */
export const getMeasurementTypeByGranularity = (
  granularity: BucketGranularity
): [MeasurementType, boolean] => {
  switch (granularity) {
    case "minute":
      return ["hour", true];
    case "5-minutes":
      return ["hour", true];
    default:
      return [granularity, false];
  }
};

/**
 * Helper function to get buckets for weather station in specified date interval and granularity
 * @author filipditrich
 * @export
 */
export const getBucketsForStation = async ({
  dateFrom,
  dateTo,
  granularity,
  weatherStationId,
}: {
  dateFrom: Date;
  dateTo: Date;
  granularity: BucketGranularity;
  weatherStationId: string;
}): Promise<BucketData[]> => {
  /** generate buckets */
  let buckets: Date[] = [];
  switch (granularity) {
    case "minute":
    case "5-minutes":
    case "hour":
      buckets = eachHourOfInterval({ start: dateFrom, end: dateTo });
      break;
    case "day":
      buckets = eachDayOfInterval({ start: dateFrom, end: dateTo });
      break;
    case "month":
      buckets = eachMonthOfInterval({ start: dateFrom, end: dateTo });
      break;
  }

  /** get correct measurement type by requested granularity */
  const [measurementTypeByGranularity, shouldMeasurementsBeUpScaled] =
    getMeasurementTypeByGranularity(granularity);

  /** get correct measurements */
  const measurements = await MeasurementModel.find({
    nodeId: weatherStationId,
    measuredAt: { $gte: dateFrom, $lte: dateTo },
    type: measurementTypeByGranularity,
  });

  /** fill buckets with measurements */
  const bucketsWithMeasurements = buckets.reduce(
    (acc, bucketDate, currentIndex) => {
      const measurement = measurements.find((m) =>
        isEqual(new Date(m.toJSON().measuredAt), bucketDate)
      );

      /** upscale missing data if requested */
      if (shouldMeasurementsBeUpScaled) {
        const previousBucketWithMeasurement = acc
          .reverse()
          .find((b) => !b.isCalculated);

        /** upscale data with previous bucket */
        const upScaledData = previousBucketWithMeasurement
          ? upscaleDataBetweenBuckets({
              leftBucket: {
                date: previousBucketWithMeasurement.date,
                temperature: previousBucketWithMeasurement?.temperature || null,
                humidity: previousBucketWithMeasurement?.humidity || null,
                type: measurementTypeByGranularity,
              },
              rightBucket: {
                date: bucketDate,
                temperature: measurement?.temperature || null,
                humidity: measurement?.humidity || null,
                type: measurementTypeByGranularity,
              },
              granularity,
            })
          : [];

        return [
          ...acc,
          /** return up scaled data */
          ...upScaledData,
          /** return current bucket */
          {
            date: bucketDate,
            temperature: measurement?.temperature || null,
            humidity: measurement?.humidity || null,
          },
        ];
      }

      /** return current/empty bucket */
      return [
        ...acc,
        {
          date: bucketDate,
          temperature: measurement?.temperature || null,
          humidity: measurement?.humidity || null,
        },
      ];
    },
    [] as BucketData[]
  );

  /** send the data */
  return bucketsWithMeasurements.sort(sortBy("date", { direction: "desc" }));
};

// =============================================================================

export const downscaleData = async (
  type: Exclude<MeasurementType, "5-minutes">
) => {
  try {
    const now = new Date();
    const minDate = new Date();
    let min;
    let findType: MeasurementType;

    switch (type) {
      case "hour": {
        minDate.setHours(now.getHours() - 1);
        min = minDate.toISOString();
        findType = "5-minutes";

        break;
      }
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

type TransformedDataType = {
  temperature: number;
  humidity: number;
  numberOfMeasurements: number;
};
