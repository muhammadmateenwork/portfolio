"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/admin/AuthContext";
import ImageUpload from "@/components/admin/ImageUpload";
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
import { Plus, Pencil, Trash2, GripVertical, X, UploadCloud, Loader2, Images, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Project {
  id: string; title: string; description: string; longDescription: string; thumbnail: string;
  gallery: string[]; liveUrl: string; githubUrl: string; techStack: string[];
  features: string[]; category: string; featured: boolean; visible: boolean; order: number;
  seo: { title: string; description: string; keywords: string };
}

const emptyProject = {
  title: "", description: "", longDescription: "", thumbnail: "", gallery: [],
  liveUrl: "", githubUrl: "", techStack: [], features: [], category: "Web App",
  featured: false, visible: true, order: 0, seo: { title: "", description: "", keywords: "" },
};

// ─── Sortable Gallery Item ────────────────────────────────────────────
function SortableGalleryItem({ id, url, index, onRemove, onMoveLeft, onMoveRight, isFirst, isLast }: {
  id: string; url: string; index: number; onRemove: () => void;
  onMoveLeft: () => void; onMoveRight: () => void; isFirst: boolean; isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-zinc-900 overflow-hidden ${isDragging ? "border-emerald-500 shadow-xl shadow-emerald-500/20 z-50 opacity-90" : "border-zinc-700"}`}
    >
      {/* ─── Always-visible drag bar at top ─── */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-2 py-1.5 bg-zinc-800/90 border-b border-zinc-700/50 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 text-zinc-500" />
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Move Left */}
          <button
            onClick={onMoveLeft}
            disabled={isFirst}
            type="button"
            className={`p-1 rounded transition-colors ${isFirst ? "text-zinc-700 cursor-not-allowed" : "text-zinc-400 hover:text-white hover:bg-zinc-700"}`}
            title="Move left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Move Right */}
          <button
            onClick={onMoveRight}
            disabled={isLast}
            type="button"
            className={`p-1 rounded transition-colors ${isLast ? "text-zinc-700 cursor-not-allowed" : "text-zinc-400 hover:text-white hover:bg-zinc-700"}`}
            title="Move right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Remove */}
          <button
            onClick={onRemove}
            type="button"
            className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
            title="Remove image"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Image ─── */}
      <div className="aspect-video bg-zinc-800">
        <img src={url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" draggable={false} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function ProjectsAdmin() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyProject);
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  // Gallery bulk upload state
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryPendingFiles, setGalleryPendingFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchRef = useRef(false);

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects?admin=true", { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      if (res.ok) setProjects(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchRef.current && token) {
      fetchRef.current = true;
      fetchProjects();
    }
  }, [token]);

  const getHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/projects", { method: editing ? "PUT" : "POST", headers: getHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? "Project saved to database ✓" : "Project created in database ✓");
        setOpen(false);
        setEditing(null);
        setForm(emptyProject);
        fetchRef.current = false;
        fetchProjects();
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 503) {
          toast.error("Database not connected! Project was NOT saved.");
        } else {
          toast.error(errData.error || "Failed to save project");
        }
      }
    } catch {
      toast.error("Network error — project NOT saved.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) { toast.success("Project deleted"); fetchRef.current = false; fetchProjects(); }
    } catch {}
  };

  // Multi-file gallery select
  const handleGalleryFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const previews: string[] = [];
    let loaded = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push(ev.target?.result as string);
        loaded++;
        if (loaded === files.length) {
          setGalleryPreviews(previews);
          setGalleryPendingFiles(files);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Upload all pending gallery files
  const confirmGalleryUpload = async () => {
    if (galleryPendingFiles.length === 0 || !token) return;
    setGalleryUploading(true);

    const uploadedUrls: string[] = [];
    let failedCount = 0;

    for (const file of galleryPendingFiles) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "portfolio/projects");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    if (uploadedUrls.length > 0) {
      setForm({ ...form, gallery: [...form.gallery, ...uploadedUrls] });
      toast.success(`${uploadedUrls.length} image(s) added to gallery${failedCount > 0 ? `, ${failedCount} failed` : ""}`);
    } else {
      toast.error("All uploads failed");
    }

    setGalleryUploading(false);
    setGalleryPreviews([]);
    setGalleryPendingFiles([]);
  };

  const cancelGalleryPreview = () => {
    setGalleryPreviews([]);
    setGalleryPendingFiles([]);
  };

  // Remove a single gallery image with undo
  const removeGalleryImage = (index: number) => {
    const removed = form.gallery[index];
    const backup = [...form.gallery];
    const updated = form.gallery.filter((_, i) => i !== index);
    setForm({ ...form, gallery: updated });
    toast.success(`Screenshot #${index + 1} removed`, {
      action: {
        label: "Undo",
        onClick: () => setForm({ ...form, gallery: backup }),
      },
      duration: 4000,
    });
  };

  // Move gallery image left/right
  const moveGalleryImage = (from: number, direction: "left" | "right") => {
    const to = direction === "left" ? from - 1 : from + 1;
    if (to < 0 || to >= form.gallery.length) return;
    const updated = arrayMove(form.gallery, from, to);
    setForm({ ...form, gallery: updated });
  };

  // Drag-and-drop reorder handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = form.gallery.indexOf(active.id as string);
    const newIndex = form.gallery.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const updated = arrayMove(form.gallery, oldIndex, newIndex);
    setForm({ ...form, gallery: updated });
  };

  // Remove all gallery images
  const removeAllGalleryImages = () => {
    if (!confirm("Remove all screenshots?")) return;
    const backup = [...form.gallery];
    setForm({ ...form, gallery: [] });
    toast.success("All screenshots removed", {
      action: {
        label: "Undo",
        onClick: () => setForm({ ...form, gallery: backup }),
      },
      duration: 5000,
    });
  };

  // Remove a single pending preview image
  const removePendingPreview = (index: number) => {
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    const newFiles = galleryPendingFiles.filter((_, i) => i !== index);
    setGalleryPreviews(newPreviews);
    setGalleryPendingFiles(newFiles);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ ...p, techStack: p.techStack || [], features: p.features || [], gallery: p.gallery || [], seo: p.seo || { title: "", description: "", keywords: "" } });
    setGalleryPreviews([]);
    setGalleryPendingFiles([]);
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyProject, order: projects.length });
    setGalleryPreviews([]);
    setGalleryPendingFiles([]);
    setOpen(true);
  };

  const addTech = () => {
    if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
      setForm({ ...form, techStack: [...form.techStack, techInput.trim()] });
      setTechInput("");
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !form.features.includes(featureInput.trim())) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-zinc-500 mt-1">Manage your portfolio projects</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id} className="bg-zinc-900/50 border-zinc-800 p-4 flex items-center gap-4">
              <GripVertical className="h-5 w-5 text-zinc-600 shrink-0" />
              <div className="w-16 h-12 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                {p.thumbnail ? <img src={p.thumbnail} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No img</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white truncate">{p.title}</h3>
                  {p.featured && <Badge className="bg-emerald-500 text-zinc-950 border-0 text-xs">Featured</Badge>}
                  {!p.visible && <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">Hidden</Badge>}
                  {(p.gallery?.length || 0) > 0 && (
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 flex items-center gap-1">
                      <Images className="h-3 w-3" /> {p.gallery.length}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-500 truncate">{p.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="text-zinc-400 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {projects.length === 0 && <p className="text-zinc-500 text-center py-12">No projects yet. Add your first project!</p>}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {["Web App", "SaaS", "AI/ML", "Mobile App", "E-Commerce", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Short Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} className="bg-zinc-900 border-zinc-700 text-white resize-none" />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Long Description</Label>
              <Textarea value={form.longDescription} onChange={(e) => setForm({...form, longDescription: e.target.value})} rows={4} className="bg-zinc-900 border-zinc-700 text-white resize-none" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Live URL</Label>
                <Input value={form.liveUrl} onChange={(e) => setForm({...form, liveUrl: e.target.value})} className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">GitHub URL</Label>
                <Input value={form.githubUrl} onChange={(e) => setForm({...form, githubUrl: e.target.value})} className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Thumbnail (auto-resized on display)</Label>
              <ImageUpload
                value={form.thumbnail}
                onChange={(url) => setForm({...form, thumbnail: url})}
                label="Upload Thumbnail"
                folder="portfolio/projects"
                token={token}
                previewClass="w-24 h-16"
              />
              <p className="text-xs text-zinc-600">Any size works — it will be auto-resized on the portfolio display.</p>
            </div>

            {/* ─── Gallery — Drag & Drop with Remove ─── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-zinc-300">Gallery Screenshots</Label>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    ⠿ Drag the top bar to reorder · ◀▶ Arrow buttons to move · 🗑 Remove individual or all
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {form.gallery.length > 0 && (
                    <>
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">{form.gallery.length} image(s)</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={removeAllGalleryImages}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Remove All
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Uploaded gallery images — Drag & Drop sortable */}
              {form.gallery.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={form.gallery}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.gallery.map((url, i) => (
                        <SortableGalleryItem
                          key={url}
                          id={url}
                          url={url}
                          index={i}
                          isFirst={i === 0}
                          isLast={i === form.gallery.length - 1}
                          onRemove={() => removeGalleryImage(i)}
                          onMoveLeft={() => moveGalleryImage(i, "left")}
                          onMoveRight={() => moveGalleryImage(i, "right")}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {form.gallery.length === 0 && galleryPreviews.length === 0 && (
                <div className="border border-dashed border-zinc-700 rounded-lg p-8 text-center">
                  <Images className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No screenshots yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Click the button below to add screenshots</p>
                </div>
              )}

              {/* Pending previews (before confirm) — with individual remove */}
              {galleryPreviews.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-400 font-medium">{galleryPreviews.length} image(s) selected — review & upload</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={confirmGalleryUpload} disabled={galleryUploading} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 h-8">
                        {galleryUploading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Uploading...</> : `Upload ${galleryPreviews.length} Image(s)`}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelGalleryPreview} disabled={galleryUploading} className="text-red-400 hover:text-red-300 h-8">
                        Cancel All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {galleryPreviews.map((preview, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border-2 border-emerald-500/30 aspect-video bg-zinc-800">
                        <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        {/* Remove this pending image */}
                        <button
                          onClick={() => removePendingPreview(i)}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                          title="Remove this image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-zinc-300 px-1.5 py-0.5 rounded">Pending</span>
                      </div>
                    ))}
                  </div>
                  {galleryUploading && (
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  )}
                </div>
              )}

              {/* Upload button */}
              {galleryPreviews.length === 0 && (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <UploadCloud className="h-4 w-4" />
                  Select Screenshots (multiple)
                </button>
              )}

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryFilesSelect}
              />
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Tech Stack</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.techStack.map((t) => (
                  <Badge key={t} variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                    {t}
                    <button onClick={() => setForm({...form, techStack: form.techStack.filter(x => x !== t)})} className="ml-1 hover:text-red-400"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} placeholder="Add technology" className="bg-zinc-900 border-zinc-700 text-white flex-1" />
                <Button type="button" onClick={addTech} variant="outline" className="border-zinc-700 text-zinc-300">Add</Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Features</Label>
              <div className="space-y-1 mb-2">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span>▸ {f}</span>
                    <button onClick={() => setForm({...form, features: form.features.filter((_, j) => j !== i)})} className="text-red-400 hover:text-red-300"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder="Add feature" className="bg-zinc-900 border-zinc-700 text-white flex-1" />
                <Button type="button" onClick={addFeature} variant="outline" className="border-zinc-700 text-zinc-300">Add</Button>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({...form, featured: v})} />
                <Label className="text-zinc-300">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.visible} onCheckedChange={(v) => setForm({...form, visible: v})} />
                <Label className="text-zinc-300">Visible</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})} className="bg-zinc-900 border-zinc-700 text-white w-24" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}