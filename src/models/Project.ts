import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  gallery: string[];
  liveUrl: string;
  githubUrl: string;
  techStack: string[];
  features: string[];
  category: string;
  featured: boolean;
  visible: boolean;
  order: number;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    gallery: [{ type: String }],
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    techStack: [{ type: String }],
    features: [{ type: String }],
    category: { type: String, default: "Web App" },
    featured: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

ProjectSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
