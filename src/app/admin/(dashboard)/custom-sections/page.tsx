"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/admin/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, X, Code, Server, Palette, Cloud, Smartphone, Database, Globe, Shield, Lightbulb, RefreshCw, MessageSquare } from "lucide-react";

interface CardItem {
  icon: string;
  title: string;
  description: string;
}

interface TimelineItem {
  step: number;
  title: string;
  description: string;
}

interface CustomSection {
  id: string; sectionKey: string; title: string; subtitle: string; content: string; type: string; cards: CardItem[]; timelines: TimelineItem[]; visible: boolean; order: number;
}

const lucideIconOptions = [
  { value: "code", label: "Code", Icon: Code },
  { value: "server", label: "Server", Icon: Server },
  { value: "palette", label: "Palette", Icon: Palette },
  { value: "cloud", label: "Cloud", Icon: Cloud },
  { value: "smartphone", label: "Smartphone", Icon: Smartphone },
  { value: "database", label: "Database", Icon: Database },
  { value: "globe", label: "Globe", Icon: Globe },
  { value: "shield", label: "Shield", Icon: Shield },
  { value: "lightbulb", label: "Lightbulb", Icon: Lightbulb },
  { value: "refresh", label: "Refresh", Icon: RefreshCw },
  { value: "chat", label: "Chat", Icon: MessageSquare },
];

const emptySection = { sectionKey: "", title: "", subtitle: "", content: "", type: "text", cards: [], timelines: [], visible: true, order: 0 };
const emptyCard: CardItem = { icon: "code", title: "", description: "" };
const emptyTimeline: TimelineItem = { step: 1, title: "", description: "" };

export default function CustomSectionsAdmin() {
  const { token } = useAuth();
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomSection | null>(null);
  const [form, setForm] = useState(emptySection);
  const [saving, setSaving] = useState(false);
  const fetchRef = useRef(false);

  const getHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/custom-sections?admin=true", { headers: getHeaders() });
      if (res.ok) setSections(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchRef.current && token) {
      fetchRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSections();
    }
  }, [token]);

  const handleSave = async () => {
    if (!form.sectionKey.trim() || !form.title.trim()) { toast.error("Section key and title are required"); return; }
    setSaving(true);
    try {
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/custom-sections", { method: editing ? "PUT" : "POST", headers: getHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? "Section updated" : "Section created");
        setOpen(false); setEditing(null); setForm(emptySection); fetchRef.current = false; fetchSections();
      } else { toast.error("Failed to save"); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    try {
      const res = await fetch(`/api/custom-sections?id=${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) { toast.success("Section deleted"); fetchRef.current = false; fetchSections(); }
    } catch {}
  };

  const openEdit = (s: CustomSection) => {
    setEditing(s);
    setForm({
      ...s,
      cards: Array.isArray(s.cards) ? s.cards : [],
      timelines: Array.isArray(s.timelines) ? s.timelines : [],
    });
    setOpen(true);
  };
  const openCreate = () => { setEditing(null); setForm({ ...emptySection, order: sections.length }); setOpen(true); };

  // Card management
  const addCard = () => setForm({ ...form, cards: [...form.cards, { ...emptyCard }] });
  const removeCard = (index: number) => setForm({ ...form, cards: form.cards.filter((_, i) => i !== index) });
  const updateCard = (index: number, field: keyof CardItem, value: string | number) => {
    const updated = [...form.cards];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, cards: updated });
  };

  // Timeline management
  const addTimeline = () => setForm({ ...form, timelines: [...form.timelines, { ...emptyTimeline, step: form.timelines.length + 1 }] });
  const removeTimeline = (index: number) => setForm({ ...form, timelines: form.timelines.filter((_, i) => i !== index) });
  const updateTimeline = (index: number, field: keyof TimelineItem, value: string | number) => {
    const updated = [...form.timelines];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, timelines: updated });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Sections</h1>
          <p className="text-zinc-500 mt-1">Manage custom content sections</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
          <Plus className="h-4 w-4 mr-2" /> Add Section
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {sections.map((s) => (
            <Card key={s.id} className="bg-zinc-900/50 border-zinc-800 p-4 flex items-center gap-4">
              <GripVertical className="h-5 w-5 text-zinc-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{s.title}</h3>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">{s.sectionKey}</Badge>
                  <Badge variant="outline" className={`text-xs ${s.type === "cards" ? "border-emerald-700 text-emerald-400" : s.type === "timelines" ? "border-cyan-700 text-cyan-400" : "border-zinc-700 text-zinc-500"}`}>
                    {s.type}
                  </Badge>
                  {!s.visible && <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">Hidden</Badge>}
                </div>
                <p className="text-sm text-zinc-500 truncate">
                  {s.type === "cards" ? `${(s.cards || []).length} card(s)` : s.type === "timelines" ? `${(s.timelines || []).length} step(s)` : (s.subtitle || s.content?.slice(0, 80))}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(s)} className="text-zinc-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
          {sections.length === 0 && <p className="text-zinc-500 text-center py-12">No custom sections yet.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">{editing ? "Edit Section" : "Add Section"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Section Key *</Label>
                <Input value={form.sectionKey} onChange={(e) => setForm({...form, sectionKey: e.target.value.replace(/\s+/g, "-").toLowerCase()})} placeholder="e.g., process, testimonials" className="bg-zinc-900 border-zinc-700 text-white" disabled={!!editing} />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="timelines">Timelines</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-zinc-900 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({...form, subtitle: e.target.value})} className="bg-zinc-900 border-zinc-700 text-white" />
            </div>

            {/* Content field for text/markdown/html */}
            {(form.type === "text" || form.type === "markdown" || form.type === "html") && (
              <div className="space-y-2">
                <Label className="text-zinc-300">Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={8} className="bg-zinc-900 border-zinc-700 text-white resize-none font-mono text-sm" placeholder={form.type === "markdown" ? "## Heading\n\nParagraph text..." : form.type === "html" ? "<h3>Heading</h3><p>Content...</p>" : "Section content..."} />
              </div>
            )}

            {/* Cards editor */}
            {form.type === "cards" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Cards</Label>
                  <Button type="button" size="sm" onClick={addCard} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30">
                    <Plus className="h-3 w-3 mr-1" /> Add Card
                  </Button>
                </div>
                {form.cards.map((card, index) => (
                  <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 relative">
                    <button type="button" onClick={() => removeCard(index)} className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-500">Icon</Label>
                        <Select value={card.icon} onValueChange={(v) => updateCard(index, "icon", v)}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {lucideIconOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-2">
                                  <opt.Icon className="h-4 w-4" />
                                  {opt.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-500">Title</Label>
                        <Input value={card.title} onChange={(e) => updateCard(index, "title", e.target.value)} placeholder="Card title" className="bg-zinc-800 border-zinc-700 text-white h-9 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Description</Label>
                      <Textarea value={card.description} onChange={(e) => updateCard(index, "description", e.target.value)} placeholder="Card description" rows={2} className="bg-zinc-800 border-zinc-700 text-white text-sm resize-none" />
                    </div>
                  </div>
                ))}
                {form.cards.length === 0 && (
                  <p className="text-zinc-600 text-sm text-center py-4 border border-dashed border-zinc-800 rounded-lg">
                    No cards yet. Click &quot;Add Card&quot; to get started.
                  </p>
                )}
              </div>
            )}

            {/* Timelines editor */}
            {form.type === "timelines" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Timeline Steps</Label>
                  <Button type="button" size="sm" onClick={addTimeline} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30">
                    <Plus className="h-3 w-3 mr-1" /> Add Step
                  </Button>
                </div>
                {form.timelines.map((item, index) => (
                  <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3 relative">
                    <button type="button" onClick={() => removeTimeline(index)} className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-emerald-400 font-bold text-xs">{item.step || index + 1}</span>
                      </div>
                      <span className="text-sm text-zinc-400">Step {item.step || index + 1}</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-500">Step Number</Label>
                        <Input type="number" value={item.step} onChange={(e) => updateTimeline(index, "step", parseInt(e.target.value) || index + 1)} className="bg-zinc-800 border-zinc-700 text-white h-9 text-sm w-20" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-500">Title</Label>
                        <Input value={item.title} onChange={(e) => updateTimeline(index, "title", e.target.value)} placeholder="Step title" className="bg-zinc-800 border-zinc-700 text-white h-9 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Description</Label>
                      <Textarea value={item.description} onChange={(e) => updateTimeline(index, "description", e.target.value)} placeholder="Step description" rows={2} className="bg-zinc-800 border-zinc-700 text-white text-sm resize-none" />
                    </div>
                  </div>
                ))}
                {form.timelines.length === 0 && (
                  <p className="text-zinc-600 text-sm text-center py-4 border border-dashed border-zinc-800 rounded-lg">
                    No timeline steps yet. Click &quot;Add Step&quot; to get started.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch checked={form.visible} onCheckedChange={(v) => setForm({...form, visible: v})} />
              <Label className="text-zinc-300">Visible</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})} className="bg-zinc-900 border-zinc-700 text-white w-24" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
