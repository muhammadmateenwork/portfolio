import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  description: string;
  icon: string;
  visible: boolean;
  order: number;
}

const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  icon: { type: String, default: "" },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

ServiceSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
