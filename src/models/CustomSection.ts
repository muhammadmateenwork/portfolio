import mongoose, { Schema, Document } from "mongoose";

export interface CardItem {
  icon: string;
  title: string;
  description: string;
}

export interface TimelineItem {
  step: number;
  title: string;
  description: string;
}

export interface ICustomSection extends Document {
  sectionKey: string;
  title: string;
  subtitle: string;
  content: string;
  type: string;
  cards: CardItem[];
  timelines: TimelineItem[];
  visible: boolean;
  order: number;
}

const CardItemSchema = new Schema<CardItem>({
  icon: { type: String, default: "" },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

const TimelineItemSchema = new Schema<TimelineItem>({
  step: { type: Number, default: 0 },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

const CustomSectionSchema = new Schema<ICustomSection>({
  sectionKey: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: "" },
  content: { type: String, default: "" },
  type: { type: String, default: "text", enum: ["text", "markdown", "html", "cards", "timelines"] },
  cards: { type: [CardItemSchema], default: [] },
  timelines: { type: [TimelineItemSchema], default: [] },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

CustomSectionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.CustomSection || mongoose.model<ICustomSection>("CustomSection", CustomSectionSchema);
