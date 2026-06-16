"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  token: string | null;
  accept?: string;
  previewClass?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Upload",
  folder = "portfolio",
  token,
  accept = "image/*",
  previewClass = "w-20 h-14",
  placeholder = "No image",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    setPendingFile(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile || !token) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        toast.success("Image uploaded successfully");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setPreview(null);
      setPendingFile(null);
    }
  };

  const handleCancelPreview = () => {
    setPreview(null);
    setPendingFile(null);
  };

  const handleRemoveExisting = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {/* Existing image or pending preview */}
      <div className="flex items-start gap-3 flex-wrap">
        {/* Show existing uploaded image */}
        {value && !preview && (
          <div className={`relative ${previewClass} rounded-lg overflow-hidden border border-zinc-700 group`}>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              onClick={handleRemoveExisting}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Show pending preview with confirm/cancel */}
        {preview && (
          <div className="relative">
            <div className={`${previewClass} rounded-lg overflow-hidden border-2 border-emerald-500/50`}>
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-2 -right-2 flex gap-1">
              <button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="p-1 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 transition-colors disabled:opacity-50"
                title="Confirm upload"
              >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              </button>
              <button
                onClick={handleCancelPreview}
                disabled={uploading}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors disabled:opacity-50"
                title="Cancel"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Upload button (hidden when preview pending) */}
        {!preview && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading..." : label}
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Placeholder if no image */}
        {!value && !preview && (
          <div className={`${previewClass} rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center`}>
            <ImageIcon className="h-5 w-5 text-zinc-600" />
          </div>
        )}
      </div>

      {/* Upload progress text */}
      {uploading && (
        <p className="text-xs text-zinc-500">Uploading... please wait</p>
      )}
    </div>
  );
}
