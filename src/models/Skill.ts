import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  icon: string;
  category: string;
  proficiency: number;
  visible: boolean;
  order: number;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: "" },
  category: { type: String, default: "Frontend" },
  proficiency: { type: Number, default: 80, min: 0, max: 100 },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

SkillSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);
