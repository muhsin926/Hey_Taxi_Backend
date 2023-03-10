import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface Vehicle extends Document {
  id: string;
  model: string;
  year: number;
  RC: string;
  reg_no: string;
  category: string;
  insurance: string;
  driverId: ObjectId;
}

const vehicleSchema = new Schema(
    {
        model: {type: String},
        year: {type: Number},
        RC: {type: String},
        reg_no: {type: String},
        category: {type: String},
        insurance: {type: String},
        driverId: {
            type: mongoose.Types.ObjectId,
            ref: 'Driver'
        },
        
    },
    { timestamps: true }
);


export default mongoose.model<Vehicle>("Vehicle", vehicleSchema);