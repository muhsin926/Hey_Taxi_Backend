import { RequestHandler } from "express";
import passengerModel from "../../model/passenger/passengerModel";

export const getPassenger: RequestHandler = async (req, res) => {
  const page = req.query.page as string;
  const limit = 1;
  const skip: number = parseInt(page) * limit;
  const count = await passengerModel.find({}).countDocuments();
  const allPassenger = await passengerModel.find({}).skip(skip).limit(limit);
  const pageCount = Math.ceil(count / limit);
  if (allPassenger) {
    return res.status(200).json({ passenger: allPassenger, pageCount });
  }
};

export const deletePass: RequestHandler = async (req, res) => {
  const { id } = req.query;
  await passengerModel.deleteOne({ _id: id });
  return res.status(200).json({ status: true });
};

export const updatePass: RequestHandler = async (req, res) => {
  const { id } = req.query;
  const currentUser = await passengerModel.findOne({ _id: id });
  await passengerModel.updateOne(
    { _id: id },
    {
      block: !currentUser?.block,
    }
  );
  res.status(200).json({ status: true });
};
