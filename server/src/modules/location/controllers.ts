import { HttpException } from "../../exceptions";
import { omitFrom } from "../../helpers/common";
import {
  ErrorCode,
  IdParam,
  RequestWithUser,
  ResponseWithError,
  StatusCode,
} from "../../types";
import { WeatherStation } from "../weather-station/types";
import {
  deleteLocationById,
  findLocationById,
  LocationModel,
  updateLocationById,
} from "./model";
import {
  CreateLocationRequestBody,
  DeleteLocationResponse,
  Location,
} from "./types";

export const create = async (
  req: RequestWithUser<
    Record<string, string>,
    Location,
    CreateLocationRequestBody
  >,
  res: ResponseWithError<Location>
) => {
  try {
    const newLocation = new LocationModel(req.body);
    const result = await newLocation.save();
    res.json(result);
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
    // @ts-ignore
    // res.send(err);
  }
};

export const update = async (
  req: RequestWithUser<IdParam, Location, Partial<Location>>,
  res: ResponseWithError<Location>
) => {
  try {
    const { id } = req.params;

    const location = await findLocationById(id);

    if (!location) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: "Location not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    const updatedLocation = await updateLocationById(id, req.body);

    if (!updatedLocation) {
      return res.status(StatusCode.SERVER_ERROR).json({
        error: {
          message:
            "Error occurred when updating the location, please try again later",
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    res.send(updatedLocation);
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

type FindAllDtoOut = Omit<Location, "nodeId"> & {
  weatherStation: WeatherStation;
};
export const findAll = async (
  req: RequestWithUser<
    Record<string, string>,
    FindAllDtoOut[],
    Partial<Location>
  >,
  res: ResponseWithError<FindAllDtoOut[]>
) => {
  try {
    const locations = await LocationModel.find().populate<{
      nodeId: WeatherStation;
    }>("nodeId");
    // @ts-ignore
    const mappedLocations: FindAllDtoOut[] = locations.map((location) => ({
      ...omitFrom(location.toJSON(), "nodeId"),
      weatherStation: location.nodeId,
    }));
    res.send(mappedLocations);
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

type FindOneDtoOut = Omit<Location, "nodeId"> & {
  weatherStation: WeatherStation;
};
export const findOne = async (
  req: RequestWithUser<IdParam, FindOneDtoOut, undefined>,
  res: ResponseWithError<FindOneDtoOut>
) => {
  try {
    const location = await LocationModel.findById(req.params.id).populate<{
      nodeId: WeatherStation;
    }>("nodeId");

    if (!location) {
      return res.status(404).json({
        error: {
          message: "Location not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
        },
      });
    }

    // @ts-ignore
    res.send({
      ...omitFrom(location.toJSON(), "nodeId"),
      weatherStation: location.nodeId,
    });
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

export const deleteLocation = async (
  req: RequestWithUser<IdParam, DeleteLocationResponse, undefined>,
  res: ResponseWithError<DeleteLocationResponse>
) => {
  try {
    const { id } = req.params;

    const location = await findLocationById(id);

    if (!location) {
      return res.status(StatusCode.RECORD_NOT_FOUND).json({
        error: {
          message: "Location not found",
          status: StatusCode.RECORD_NOT_FOUND,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    const deletedLocation = await deleteLocationById(id);

    if (!deletedLocation) {
      return res.status(StatusCode.SERVER_ERROR).json({
        error: {
          message:
            "Error occurred when deleting the location, please try again later",
          status: StatusCode.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
        },
      });
    }

    res.send({ success: true });
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
