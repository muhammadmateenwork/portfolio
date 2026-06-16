"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/admin/AuthContext";
import ImageUpload from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, X, Plus, Trash2, UploadCloud } from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
}

interface Settings {
  owner: { name: string; title: string; email: string; phone: string; location: string; avatar: string; resumeUrl: string };
  hero: { greeting: string; name: string; title: string; subtitle: string; description: string; ctaText: string; ctaLink: string; secondaryCtaText: string; secondaryCtaLink: string; backgroundImage: string };
  about: { title: string; subtitle: string; description: string; image: string; stats: { label: string; value: string }[] };
  socialLinks: SocialLink[];
  contact: { title: string; subtitle: string; email: string; phone: string; location: string; availability: string; projectTypes: string[]; budgetRanges: string[] };
  navbar: { links: { label: string; href: string }[] };
  footer: { text: string; copyright: string };
  seo: { title: string; description: string; keywords: string; ogImage: string };
  sectionVisibility: { hero: boolean; about: boolean; skills: boolean; projects: boolean; services: boolean; contact: boolean };
  sectionTitles: { skills: string; projects: string; services: string; contact: string };
}

const availablePlatforms = ["github", "linkedin", "twitter", "instagram", "facebook", "youtube", "dribbble", "behance"];

export default function SettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("owner");
  const fetchRef = useRef(false);

  // Resume upload state (separate because it's PDF, not image)
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Inputs for adding items to arrays
  const [projectTypeInput, setProjectTypeInput] = useState("");
  const [budgetRangeInput, setBudgetRangeInput] = useState("");
  const [newPlatform, setNewPlatform] = useState("");

  const getHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setSettings(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchRef.current) {
      fetchRef.current = true;
      fetchSettings();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: getHeaders(), body: JSON.stringify(settings) });
      if (res.ok) {
        toast.success("Settings saved to database ✓");
        fetchSettings();
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 503) {
          toast.error("Database not connected! Your changes were NOT saved. Check your MongoDB connection.");
        } else {
          toast.error(errData.error || "Failed to save settings");
        }
      }
    } catch {
      toast.error("Network error — settings NOT saved. Is the server running?");
    }
    setSaving(false);
  };

  const updateField = (path: string, value: unknown) => {
    if (!settings) return;
    const keys = path.split(".");
    const updated = { ...settings };
    let current: Record<string, unknown> = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    setSettings(updated as Settings);
  };

  const updateSocialLink = (platform: string, field: "url" | "visible", value: string | boolean) => {
    if (!settings) return;
    const updated = settings.socialLinks.map((sl) =>
      sl.platform === platform ? { ...sl, [field]: value } : sl
    );
    setSettings({ ...settings, socialLinks: updated });
  };

  const addSocialPlatform = () => {
    if (!settings || !newPlatform.trim()) return;
    const platform = newPlatform.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (settings.socialLinks.some((sl) => sl.platform === platform)) {
      toast.error("Platform already exists");
      return;
    }
    setSettings({
      ...settings,
      socialLinks: [...settings.socialLinks, { platform, url: "", visible: false }],
    });
    setNewPlatform("");
  };

  const removeSocialPlatform = (platform: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: settings.socialLinks.filter((sl) => sl.platform !== platform),
    });
  };

  // Resume upload handlers
  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumePreview(file.name);
    setResumeFile(file);
    e.target.value = "";
  };

  const confirmResumeUpload = async () => {
    if (!resumeFile || !token) return;
    setResumeUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", resumeFile);
      fd.append("folder", "portfolio/resumes");
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (res.ok) {
        const data = await res.json();
        updateField("owner.resumeUrl", data.url);
        toast.success("Resume uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setResumeUploading(false);
      setResumePreview(null);
      setResumeFile(null);
    }
  };

  const cancelResumePreview = () => {
    setResumePreview(null);
    setResumeFile(null);
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-xl" />)}</div>;
  if (!settings) return <p className="text-zinc-500">Failed to load settings</p>;

  const tabs = [
    { id: "owner", label: "Owner Info" },
    { id: "hero", label: "Hero" },
    { id: "about", label: "About" },
    { id: "social", label: "Social Links" },
    { id: "contact", label: "Contact" },
    { id: "navbar", label: "Navbar" },
    { id: "footer", label: "Footer" },
    { id: "seo", label: "SEO" },
    { id: "visibility", label: "Sections" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-500 mt-1">Configure your portfolio content</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
          <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-emerald-500 text-zinc-950" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Owner */}
      {activeTab === "owner" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Owner Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-zinc-300">Name</Label><Input value={settings.owner.name} onChange={(e) => updateField("owner.name", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Your Name" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Title</Label><Input value={settings.owner.title} onChange={(e) => updateField("owner.title", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Full Stack Developer" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Email</Label><Input value={settings.owner.email} onChange={(e) => updateField("owner.email", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="your@email.com" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Phone</Label><Input value={settings.owner.phone} onChange={(e) => updateField("owner.phone", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="+1 (555) 123-4567" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Location</Label><Input value={settings.owner.location} onChange={(e) => updateField("owner.location", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="City, Country" /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Avatar</Label>
              <ImageUpload
                value={settings.owner.avatar}
                onChange={(url) => updateField("owner.avatar", url)}
                label="Upload Avatar"
                folder="portfolio"
                token={token}
                previewClass="w-16 h-16 rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Resume/CV</Label>
              <div className="flex items-center gap-3 flex-wrap">
                {settings.owner.resumeUrl && !resumePreview && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                    <span className="text-sm text-emerald-400">✓ PDF uploaded</span>
                    <a
                      href={settings.owner.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-emerald-400 underline underline-offset-2 transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => updateField("owner.resumeUrl", "")}
                      className="text-red-400 hover:text-red-300 ml-1"
                      title="Remove resume"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {resumePreview ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">{resumePreview}</span>
                    <Button size="sm" onClick={confirmResumeUpload} disabled={resumeUploading} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 h-8">
                      {resumeUploading ? "Uploading..." : "Confirm"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelResumePreview} disabled={resumeUploading} className="text-red-400 hover:text-red-300 h-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <UploadCloud className="h-4 w-4" />Upload PDF
                  </button>
                )}
                <input ref={resumeInputRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeFileSelect} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero */}
      {activeTab === "hero" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-zinc-300">Greeting</Label><Input value={settings.hero.greeting} onChange={(e) => updateField("hero.greeting", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Hello, I'm" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Name</Label><Input value={settings.hero.name} onChange={(e) => updateField("hero.name", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Your Name" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Title</Label><Input value={settings.hero.title} onChange={(e) => updateField("hero.title", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Full Stack Developer" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Subtitle</Label><Input value={settings.hero.subtitle} onChange={(e) => updateField("hero.subtitle", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="I craft digital experiences" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">CTA Text</Label><Input value={settings.hero.ctaText} onChange={(e) => updateField("hero.ctaText", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="View My Work" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">CTA Link</Label><Input value={settings.hero.ctaLink} onChange={(e) => updateField("hero.ctaLink", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="#projects" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Secondary CTA Text</Label><Input value={settings.hero.secondaryCtaText} onChange={(e) => updateField("hero.secondaryCtaText", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Get In Touch" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Secondary CTA Link</Label><Input value={settings.hero.secondaryCtaLink} onChange={(e) => updateField("hero.secondaryCtaLink", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="#contact" /></div>
            </div>
            <div className="space-y-2"><Label className="text-zinc-300">Description</Label><Textarea value={settings.hero.description} onChange={(e) => updateField("hero.description", e.target.value)} rows={3} className="bg-zinc-800 border-zinc-700 text-white resize-none" placeholder="Tell visitors about yourself..." /></div>
          </CardContent>
        </Card>
      )}

      {/* About */}
      {activeTab === "about" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">About Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-zinc-300">Title</Label><Input value={settings.about.title} onChange={(e) => updateField("about.title", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="About Me" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Subtitle</Label><Input value={settings.about.subtitle} onChange={(e) => updateField("about.subtitle", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Get to know me better" /></div>
            </div>
            <div className="space-y-2"><Label className="text-zinc-300">Description</Label><Textarea value={settings.about.description} onChange={(e) => updateField("about.description", e.target.value)} rows={5} className="bg-zinc-800 border-zinc-700 text-white resize-none" placeholder="Write about yourself..." /></div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Image</Label>
              <ImageUpload
                value={settings.about.image}
                onChange={(url) => updateField("about.image", url)}
                label="Upload Image"
                folder="portfolio"
                token={token}
                previewClass="w-24 h-16"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-zinc-300">Stats</Label>
              {(settings.about.stats || []).map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={stat.value} onChange={(e) => { const stats = [...settings.about.stats]; stats[i] = { ...stats[i], value: e.target.value }; updateField("about.stats", stats); }} placeholder="Value (e.g. 5+)" className="bg-zinc-800 border-zinc-700 text-white w-24" />
                  <Input value={stat.label} onChange={(e) => { const stats = [...settings.about.stats]; stats[i] = { ...stats[i], label: e.target.value }; updateField("about.stats", stats); }} placeholder="Label (e.g. Years Experience)" className="bg-zinc-800 border-zinc-700 text-white flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => { const stats = settings.about.stats.filter((_, j) => j !== i); updateField("about.stats", stats); }} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => updateField("about.stats", [...(settings.about.stats || []), { value: "", label: "" }])} className="border-zinc-700 text-zinc-300">
                <Plus className="h-4 w-4 mr-1" />Add Stat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links - with visibility controls */}
      {activeTab === "social" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Social Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-zinc-500">Add your social profiles and toggle visibility. Only visible links with a URL will appear on your portfolio.</p>
            {settings.socialLinks.map((sl) => (
              <div key={sl.platform} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Switch
                    checked={sl.visible}
                    onCheckedChange={(v) => updateSocialLink(sl.platform, "visible", v)}
                  />
                  <span className="font-medium text-white capitalize w-24 shrink-0">{sl.platform}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={sl.url}
                    onChange={(e) => updateSocialLink(sl.platform, "url", e.target.value)}
                    placeholder={`https://${sl.platform}.com/yourprofile`}
                    className="bg-zinc-800 border-zinc-700 text-white flex-1"
                  />
                  {!availablePlatforms.includes(sl.platform) && (
                    <Button size="sm" variant="ghost" onClick={() => removeSocialPlatform(sl.platform)} className="text-red-400 shrink-0"><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            ))}
            {/* Add custom platform */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <Input
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSocialPlatform(); } }}
                placeholder="Add custom platform (e.g. tiktok, medium)"
                className="bg-zinc-800 border-zinc-700 text-white flex-1"
              />
              <Button variant="outline" onClick={addSocialPlatform} className="border-zinc-700 text-zinc-300 shrink-0">
                <Plus className="h-4 w-4 mr-1" />Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact */}
      {activeTab === "contact" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Contact Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-zinc-300">Title</Label><Input value={settings.contact.title} onChange={(e) => updateField("contact.title", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Get In Touch" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Subtitle</Label><Input value={settings.contact.subtitle} onChange={(e) => updateField("contact.subtitle", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Have a project in mind?" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Email</Label><Input value={settings.contact.email} onChange={(e) => updateField("contact.email", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="your@email.com" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Phone</Label><Input value={settings.contact.phone} onChange={(e) => updateField("contact.phone", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="+1 (555) 123-4567" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Location</Label><Input value={settings.contact.location} onChange={(e) => updateField("contact.location", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="City, Country" /></div>
              <div className="space-y-2"><Label className="text-zinc-300">Availability</Label><Input value={settings.contact.availability} onChange={(e) => updateField("contact.availability", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Available for freelance work" /></div>
            </div>

            {/* Project Types */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <Label className="text-zinc-300">Project Types</Label>
              <p className="text-xs text-zinc-500">These appear as dropdown options in the contact form. Add types like: Web Application, Mobile App, API Development, etc.</p>
              <div className="flex flex-wrap gap-2">
                {(settings.contact.projectTypes || []).map((type, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300">
                    {type}
                    <button onClick={() => { const types = settings.contact.projectTypes.filter((_, j) => j !== i); updateField("contact.projectTypes", types); }} className="text-red-400 hover:text-red-300 ml-1"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={projectTypeInput} onChange={(e) => setProjectTypeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (projectTypeInput.trim()) { updateField("contact.projectTypes", [...(settings.contact.projectTypes || []), projectTypeInput.trim()]); setProjectTypeInput(""); } } }} placeholder="Add project type" className="bg-zinc-800 border-zinc-700 text-white flex-1" />
                <Button type="button" variant="outline" onClick={() => { if (projectTypeInput.trim()) { updateField("contact.projectTypes", [...(settings.contact.projectTypes || []), projectTypeInput.trim()]); setProjectTypeInput(""); } }} className="border-zinc-700 text-zinc-300"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Budget Ranges */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <Label className="text-zinc-300">Budget Ranges</Label>
              <p className="text-xs text-zinc-500">These appear as dropdown options in the contact form. Add ranges like: Less than $5,000, $5,000 - $10,000, etc.</p>
              <div className="flex flex-wrap gap-2">
                {(settings.contact.budgetRanges || []).map((range, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300">
                    {range}
                    <button onClick={() => { const ranges = settings.contact.budgetRanges.filter((_, j) => j !== i); updateField("contact.budgetRanges", ranges); }} className="text-red-400 hover:text-red-300 ml-1"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={budgetRangeInput} onChange={(e) => setBudgetRangeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (budgetRangeInput.trim()) { updateField("contact.budgetRanges", [...(settings.contact.budgetRanges || []), budgetRangeInput.trim()]); setBudgetRangeInput(""); } } }} placeholder="Add budget range" className="bg-zinc-800 border-zinc-700 text-white flex-1" />
                <Button type="button" variant="outline" onClick={() => { if (budgetRangeInput.trim()) { updateField("contact.budgetRanges", [...(settings.contact.budgetRanges || []), budgetRangeInput.trim()]); setBudgetRangeInput(""); } }} className="border-zinc-700 text-zinc-300"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navbar */}
      {activeTab === "navbar" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Navbar Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(settings.navbar?.links || []).map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={link.label} onChange={(e) => { const links = [...settings.navbar.links]; links[i] = { ...links[i], label: e.target.value }; updateField("navbar.links", links); }} placeholder="Label" className="bg-zinc-800 border-zinc-700 text-white flex-1" />
                <Input value={link.href} onChange={(e) => { const links = [...settings.navbar.links]; links[i] = { ...links[i], href: e.target.value }; updateField("navbar.links", links); }} placeholder="#section" className="bg-zinc-800 border-zinc-700 text-white flex-1" />
                <Button size="sm" variant="ghost" onClick={() => { const links = settings.navbar.links.filter((_, j) => j !== i); updateField("navbar.links", links); }} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => updateField("navbar.links", [...(settings.navbar?.links || []), { label: "", href: "" }])} className="border-zinc-700 text-zinc-300">
              <Plus className="h-4 w-4 mr-1" />Add Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      {activeTab === "footer" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Footer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-zinc-300">Text</Label><Input value={settings.footer.text} onChange={(e) => updateField("footer.text", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Crafted with passion" /></div>
            <div className="space-y-2"><Label className="text-zinc-300">Copyright</Label><Input value={settings.footer.copyright} onChange={(e) => updateField("footer.copyright", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="© 2024 Your Name. All rights reserved." /></div>
          </CardContent>
        </Card>
      )}

      {/* SEO */}
      {activeTab === "seo" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">SEO Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label className="text-zinc-300">Title</Label><Input value={settings.seo.title} onChange={(e) => updateField("seo.title", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Your Name | Full Stack Developer" /></div>
            <div className="space-y-2"><Label className="text-zinc-300">Description</Label><Textarea value={settings.seo.description} onChange={(e) => updateField("seo.description", e.target.value)} rows={3} className="bg-zinc-800 border-zinc-700 text-white resize-none" placeholder="A brief description of your portfolio..." /></div>
            <div className="space-y-2"><Label className="text-zinc-300">Keywords</Label><Input value={settings.seo.keywords} onChange={(e) => updateField("seo.keywords", e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" placeholder="full stack developer, react, nextjs, ..." /></div>
            <div className="space-y-2">
              <Label className="text-zinc-300">OG Image</Label>
              <ImageUpload
                value={settings.seo.ogImage}
                onChange={(url) => updateField("seo.ogImage", url)}
                label="Upload OG Image"
                folder="portfolio"
                token={token}
                previewClass="w-24 h-16"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Visibility */}
      {activeTab === "visibility" && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader><CardTitle className="text-white">Section Visibility & Titles</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {(["hero", "about", "skills", "projects", "services", "contact"] as const).map((section) => (
              <div key={section} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Switch
                    checked={settings.sectionVisibility[section]}
                    onCheckedChange={(v) => updateField(`sectionVisibility.${section}`, v)}
                  />
                  <span className="font-medium text-white capitalize">{section}</span>
                </div>
                {["skills", "projects", "services", "contact"].includes(section) && (
                  <Input
                    value={(settings.sectionTitles as Record<string, string>)[section] || ""}
                    onChange={(e) => updateField(`sectionTitles.${section}`, e.target.value)}
                    placeholder={`${section} title`}
                    className="bg-zinc-800 border-zinc-700 text-white w-48"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Save Button (bottom) */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
          <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
