import { RequestHandler } from "express";
import driverModel from "../../model/driver/driverModel";
import passengerModel from "../../model/passenger/passengerModel";
import requestModel from "../../model/passenger/requestModel";

const allUsers = async () => {
  const count = await passengerModel.find({}).countDocuments();
  return count;
};
const allDriver = async () => {
  const count = await driverModel.find({}).countDocuments();
  return count;
};
const allTrip = async () => {
  const count = await requestModel.find({ finished: true }).countDocuments();
  return count;
};
const getProfit = async () => {
  const amount = await requestModel.aggregate([
    {
      $match: {
        finished: true,
      },
    },
    {
      $group: {
        _id: null,
        total_fare: { $sum: "$fare" },
      },
    },
  ]);
  return amount[0].total_fare;
};

const getPassengers = async () => {
  const newPassengers = await passengerModel.find({ block: false }).limit(6);
  return newPassengers;
};
const getDrivers = async () => {
  const newDriver = await driverModel.find({ block: false }).limit(6);
  return newDriver;
};

export const getShortInfo: RequestHandler = async (req, res) => {
  const users = await allUsers();
  const drivers = await allDriver();
  const trip = await allTrip();
  const profit = await getProfit();
  if (users && drivers && trip) {
    res.status(200).json([users, drivers, trip, (profit * 20) / 100]);
  }
};

export const getNewUsers: RequestHandler = async (req, res) => {
  const passengers = await getPassengers();
  const drivers = await getDrivers();
  if (passengers && drivers) {
    res.status(200).json([passengers, drivers]);
  }
};

export const verifyDriver: RequestHandler = async (req, res) => {
  try {
    const { id } = req.query;
    await driverModel.updateOne(
      { _id: id },
      {
        $set: {
          verify: true,
        },
      }
    );
    res.status(200).json({ status: true });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getData: RequestHandler = async (req, res) => {
  try {
    const earnings = await requestModel.aggregate([
      {
        $match: {
          finished: true,
          updatedAt: {
            $gte: new Date("2023-03-01"),
            $lt: new Date("2023-04-01"),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%w",
              date: "$updatedAt",
            },
          },
          total_fare: { $sum: "$fare" },
          count: { $sum: 1 },
        },
      },
    ]);
    if (earnings) res.status(200).json({ getEarnings: earnings });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
};

export const getTrips: RequestHandler = async (req, res) => {
  try {
    const page = req.query.page as string;
    const limit = 4;
    const skip: number = parseInt(page) * limit;
    const countDoc = await requestModel
      .find({ accepted: true })
      .countDocuments();
    const trips = await requestModel
      .find({ accepted: true })
      .sort({createAt: 1})
      .populate("sender")
      .populate("receiver")
      .populate("category")
      .skip(skip)
      .limit(limit);
      const pageCount = Math.ceil(countDoc / limit);
    res.status(200).json({ trips, pageCount });
  } catch {
    res.status(400);
  }
};
