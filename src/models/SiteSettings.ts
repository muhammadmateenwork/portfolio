import mongoose, { Schema, Document } from "mongoose";

export interface ISiteSettings extends Document {
  owner: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    avatar: string;
    resumeUrl: string;
  };
  hero: {
    greeting: string;
    name: string;
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    backgroundImage: string;
  };
  about: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    stats: { label: string; value: string }[];
  };
  socialLinks: {
    platform: string;
    url: string;
    visible: boolean;
  }[];
  contact: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    location: string;
    availability: string;
    projectTypes: string[];
    budgetRanges: string[];
  };
  navbar: {
    links: { label: string; href: string }[];
  };
  footer: {
    text: string;
    copyright: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  sectionVisibility: {
    hero: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    services: boolean;
    contact: boolean;
  };
  sectionTitles: {
    skills: string;
    projects: string;
    services: string;
    contact: string;
  };
}

const StatsSchema = new Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const NavLinkSchema = new Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },
});

const SocialLinkSchema = new Schema({
  platform: { type: String, required: true },
  url: { type: String, default: "" },
  visible: { type: Boolean, default: false },
});

const SiteSettingsSchema = new Schema<ISiteSettings>({
  owner: {
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    avatar: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
  },
  hero: {
    greeting: { type: String, default: "" },
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaLink: { type: String, default: "" },
    secondaryCtaText: { type: String, default: "" },
    secondaryCtaLink: { type: String, default: "" },
    backgroundImage: { type: String, default: "" },
  },
  about: {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    stats: [StatsSchema],
  },
  socialLinks: [SocialLinkSchema],
  contact: {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    availability: { type: String, default: "" },
    projectTypes: [{ type: String }],
    budgetRanges: [{ type: String }],
  },
  navbar: {
    links: [NavLinkSchema],
  },
  footer: {
    text: { type: String, default: "" },
    copyright: { type: String, default: "" },
  },
  seo: {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
    ogImage: { type: String, default: "" },
  },
  sectionVisibility: {
    hero: { type: Boolean, default: true },
    about: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    services: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
  },
  sectionTitles: {
    skills: { type: String, default: "Skills" },
    projects: { type: String, default: "Projects" },
    services: { type: String, default: "Services" },
    contact: { type: String, default: "Get In Touch" },
  },
});

SiteSettingsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
