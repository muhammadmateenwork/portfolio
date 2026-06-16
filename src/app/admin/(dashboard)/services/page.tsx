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
import { Plus, Pencil, Trash2, GripVertical, Code, Server, Palette, Cloud, Smartphone, Database, Globe, Shield, Lightbulb } from "lucide-react";

interface Service {
  id: string; title: string; description: string; icon: string; visible: boolean; order: number;
}

const emptyService = { title: "", description: "", icon: "code", visible: true, order: 0 };
const iconOptions = [
  { value: "code", label: "Code", Icon: Code },
  { value: "server", label: "Server", Icon: Server },
  { value: "palette", label: "Palette", Icon: Palette },
  { value: "cloud", label: "Cloud", Icon: Cloud },
  { value: "smartphone", label: "Smartphone", Icon: Smartphone },
  { value: "database", label: "Database", Icon: Database },
  { value: "globe", label: "Globe", Icon: Globe },
  { value: "shield", label: "Shield", Icon: Shield },
  { value: "lightbulb", label: "Lightbulb", Icon: Lightbulb },
];

export default function ServicesAdmin() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyService);
  const [saving, setSaving] = useState(false);
  const fetchRef = useRef(false);

  const getHeaders = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services?admin=true", { headers: getHeaders() });
      if (res.ok) setServices(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchRef.current && token) {
      fetchRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchServices();
    }
  }, [token]);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/services", { method: editing ? "PUT" : "POST", headers: getHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editing ? "Service updated" : "Service created");
        setOpen(false); setEditing(null); setForm(emptyService); fetchRef.current = false; fetchServices();
      } else { toast.error("Failed to save"); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) { toast.success("Service deleted"); fetchRef.current = false; fetchServices(); }
    } catch {}
  };

  const openEdit = (s: Service) => { setEditing(s); setForm({ ...s }); setOpen(true); };
  const openCreate = () => { setEditing(null); setForm({ ...emptyService, order: services.length }); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-zinc-500 mt-1">Manage your offered services</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950">
          <Plus className="h-4 w-4 mr-2" /> Add Service
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => {
            const iconOption = iconOptions.find(o => o.value === s.icon);
            return (
              <Card key={s.id} className="bg-zinc-900/50 border-zinc-800 p-4 flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-zinc-600 shrink-0" />
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                  {iconOption ? <iconOption.Icon className="h-5 w-5 text-emerald-400" /> : <Code className="h-5 w-5 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{s.title}</h3>
                    {!s.visible && <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">Hidden</Badge>}
                  </div>
                  <p className="text-sm text-zinc-500 truncate">{s.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)} className="text-zinc-400 hover:text-white"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            );
          })}
          {services.length === 0 && <p className="text-zinc-500 text-center py-12">No services yet. Add your first service!</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">{editing ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-zinc-900 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="bg-zinc-900 border-zinc-700 text-white resize-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Icon</Label>
              <Select value={form.icon} onValueChange={(v) => setForm({...form, icon: v})}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {iconOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
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
