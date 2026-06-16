"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/admin/AuthContext";
import ImageUpload from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";

interface Skill {
  id: string; name: string; icon: string; category: string; proficiency: number; visible: boolean; order: number;
}

const emptySkill = { name: "", icon: "", category: "Frontend", proficiency: 80, visible: true, order: 0 };

export default function SkillsAdmin() {
  const { token } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState(emptySkill);
  const [saving, setSaving] = useState(false);
  const fetchRef = useRef(false);

  const getHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills?admin=true", { headers: getHeaders() });
      if (res.ok) setSkills(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchRef.current && token) {
      fetchRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSkills();
    }
  }, [token]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/skills", { method: editing ? "PUT" : "POST", headers: getHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? "Skill saved to database ✓" : "Skill created in database ✓");
        setOpen(false); setEditing(null); setForm(emptySkill); fetchRef.current = false; fetchSkills();
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 503) {
          toast.error("Database not connected! Skill was NOT saved.");
        } else {
          toast.error(errData.error || "Failed to save");
        }
      }
    } catch { toast.error("Network error — skill NOT saved."); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    try {
      const res = await fetch(`/api/skills?id=${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) { toast.success("Skill deleted"); fetchRef.current = false; fetchSkills(); }
    } catch {}
  };

  const openEdit = (s: Skill) => { setEditing(s); setForm({ ...s }); setOpen(true); };
  const openCreate = () => { setEditing(null); setForm({ ...emptySkill, order: skills.length }); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-zinc-500 mt-1">Manage your skills and expertise</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
          <Plus className="h-4 w-4 mr-2" /> Add Skill
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {skills.map((s) => (
            <Card key={s.id} className="bg-zinc-900/50 border-zinc-800 p-4 flex items-center gap-4">
              <GripVertical className="h-5 w-5 text-zinc-600 shrink-0" />
              <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                {s.icon ? <img src={s.icon} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-zinc-600">{s.name.slice(0,2)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{s.name}</h3>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">{s.category}</Badge>
                  {!s.visible && <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">Hidden</Badge>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden max-w-32">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.proficiency}%` }} />
                  </div>
                  <span className="text-xs text-zinc-500">{s.proficiency}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(s)} className="text-zinc-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
          {skills.length === 0 && <p className="text-zinc-500 text-center py-12">No skills yet. Add your first skill!</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">{editing ? "Edit Skill" : "Add Skill"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-zinc-900 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {["Frontend", "Backend", "DevOps", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Proficiency: {form.proficiency}%</Label>
              <input type="range" min="0" max="100" value={form.proficiency} onChange={(e) => setForm({...form, proficiency: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Icon</Label>
              <ImageUpload
                value={form.icon}
                onChange={(url) => setForm({...form, icon: url})}
                label="Upload Icon"
                folder="portfolio/skills"
                token={token}
                previewClass="w-12 h-12 rounded-lg"
              />
            </div>
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
