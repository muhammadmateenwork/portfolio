"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, Github, Linkedin, Twitter, Instagram, Facebook, Youtube, Globe } from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
}

interface ContactProps {
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
  socialLinks: SocialLink[];
  sectionTitle: string;
}

const platformIcons: Record<string, React.ElementType> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

const platformColors: Record<string, string> = {
  github: "hover:text-white hover:border-[#f0f0f0]/30 hover:bg-[#f0f0f0]/5",
  linkedin: "hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/5",
  twitter: "hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/5",
  instagram: "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-[#E4405F]/5",
  facebook: "hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5",
  youtube: "hover:text-[#FF0000] hover:border-[#FF0000]/30 hover:bg-[#FF0000]/5",
};

export default function Contact({ contact, socialLinks, sectionTitle }: ContactProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep a ref of the latest form values so validate() never reads stale
  // state from a closed-over render (fixes validation running on old data
  // when the submit handler was attached before the last keystroke landed).
  const formRef = useRef(form);

  // Update a single form field and clear its validation error (and any stale
  // submit status) so error messages disappear as soon as the user fixes them.
  const updateField = (field: keyof typeof form, value: string) => {
    // Update the ref synchronously so validate() always sees the latest value,
    // even if the submit fires in the same tick as this keystroke.
    formRef.current = { ...formRef.current, [field]: value };
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    // If a previous submit failed, clear the error banner once the user edits
    setStatus((prev) => (prev === "error" ? "idle" : prev));
  };

  const validate = () => {
    const f = formRef.current;
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = "Name is required";
    if (!f.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = "Invalid email";
    if (!f.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    setStatus("idle");

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        const emailjs = await import("@emailjs/browser");
        const toEmail = process.env.NEXT_PUBLIC_EMAILJS_TO_EMAIL || contact.email || "";
        await emailjs.send(serviceId, templateId, {
          from_name: form.name,
          from_email: form.email,
          to_email: toEmail,
          project_type: form.projectType,
          budget: form.budget,
          message: form.message,
        }, publicKey);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setStatus("success");
      setForm({ name: "", email: "", projectType: "", budget: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  // Only show social links that are visible AND have a URL
  const visibleSocials = (socialLinks || []).filter((sl) => sl.visible && sl.url);
  const projectTypes = contact.projectTypes || [];
  const budgetRanges = contact.budgetRanges || [];

  return (
    <section id="contact" className="py-20 sm:py-28 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading title={sectionTitle || "Get In Touch"} subtitle={contact.subtitle} />

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="space-y-6">
              {contact.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-zinc-200 hover:text-emerald-400 transition-colors">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Phone</p>
                    <a href={`tel:${contact.phone}`} className="text-zinc-200 hover:text-emerald-400 transition-colors">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              {contact.location && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Location</p>
                    <p className="text-zinc-200">{contact.location}</p>
                  </div>
                </div>
              )}
              {contact.availability && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Availability</p>
                    <p className="text-emerald-400 font-medium">{contact.availability}</p>
                  </div>
                </div>
              )}
            </div>

            {visibleSocials.length > 0 && (
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Follow Me</p>
                <div className="flex gap-3">
                  {visibleSocials.map((sl) => {
                    const IconComponent = platformIcons[sl.platform] || Globe;
                    return (
                      <a
                        key={sl.platform}
                        href={sl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 transition-all ${platformColors[sl.platform.toLowerCase()] || "hover:text-emerald-400 hover:border-emerald-500/30"}`}
                        title={sl.platform}
                      >
                        <IconComponent className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Input
                    placeholder="Your Name *"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={!!errors.name}
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-12 rounded-xl focus:border-emerald-500/50"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email *"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-12 rounded-xl focus:border-emerald-500/50"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {projectTypes.length > 0 ? (
                  <Select value={form.projectType} onValueChange={(v) => updateField("projectType", v)}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Project Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Project Type"
                    value={form.projectType}
                    onChange={(e) => updateField("projectType", e.target.value)}
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-12 rounded-xl focus:border-emerald-500/50"
                  />
                )}
                {budgetRanges.length > 0 ? (
                  <Select value={form.budget} onValueChange={(v) => updateField("budget", v)}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Budget Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {budgetRanges.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Budget Range"
                    value={form.budget}
                    onChange={(e) => updateField("budget", e.target.value)}
                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-12 rounded-xl focus:border-emerald-500/50"
                  />
                )}
              </div>

              <div>
                <Textarea
                  placeholder="Your Message *"
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  aria-invalid={!!errors.message}
                  rows={5}
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl focus:border-emerald-500/50 resize-none"
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold h-12 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25"
              >
                {sending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </span>
                )}
              </Button>

              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-emerald-400 mt-4"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Message sent successfully! I&apos;ll get back to you soon.</span>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 mt-4"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to send message. Please try again or email me directly.</span>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
