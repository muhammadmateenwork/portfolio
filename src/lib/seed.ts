import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function seedDatabase() {
  try {
    await connectDB();

    const existingSettings = await SiteSettings.findOne();
    if (existingSettings) return;

    // Create empty settings document so the CMS has something to update
    await SiteSettings.create({
      owner: {
        name: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        avatar: "",
        resumeUrl: "",
      },
      hero: {
        greeting: "",
        name: "",
        title: "",
        subtitle: "",
        description: "",
        ctaText: "",
        ctaLink: "",
        secondaryCtaText: "",
        secondaryCtaLink: "",
        backgroundImage: "",
      },
      about: {
        title: "",
        subtitle: "",
        description: "",
        image: "",
        stats: [],
      },
      socialLinks: [
        { platform: "github", url: "", visible: false },
        { platform: "linkedin", url: "", visible: false },
        { platform: "twitter", url: "", visible: false },
        { platform: "instagram", url: "", visible: false },
        { platform: "facebook", url: "", visible: false },
        { platform: "youtube", url: "", visible: false },
        { platform: "dribbble", url: "", visible: false },
        { platform: "behance", url: "", visible: false },
      ],
      contact: {
        title: "",
        subtitle: "",
        email: "",
        phone: "",
        location: "",
        availability: "",
        projectTypes: [],
        budgetRanges: [],
      },
      navbar: {
        links: [],
      },
      footer: {
        text: "",
        copyright: "",
      },
      seo: {
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
      },
      sectionVisibility: {
        hero: true,
        about: true,
        skills: true,
        projects: true,
        services: true,
        contact: true,
      },
      sectionTitles: {
        skills: "Skills",
        projects: "Projects",
        services: "Services",
        contact: "Get In Touch",
      },
    });

    console.log("Empty site settings created (no dummy data)");
  } catch (error) {
    console.error("Seed error:", error);
  }
}
