"use client";

import { useState, useEffect } from "react";
import { Check, Loader, X, ArrowLeft, ArrowRight, Star } from "lucide-react";

// Floating "Simpan Perubahan" button shown on the editor (not in edit-text mode).
export function SaveBar({
  show,
  saving,
  onSave,
}: {
  show: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-medium px-6 py-3.5 rounded-md transition-all cursor-pointer disabled:opacity-60"
    >
      {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      {saving ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-md text-[14px] font-medium shadow-lg ${
        message.includes("berhasil") ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {message}
    </div>
  );
}

export function EditBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="sticky top-0 z-[60] bg-amber-500 text-amber-950 text-center text-[11px] font-semibold py-1 px-3">
      MODE EDIT — Klik teks manapun untuk mengedit
    </div>
  );
}

export function Lightbox({
  photos,
  index,
  setIndex,
}: {
  photos: string[];
  index: number | null;
  setIndex: (i: number | null) => void;
}) {
  useEffect(() => {
    if (index === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex(Math.min(index + 1, photos.length - 1));
      if (e.key === "ArrowLeft") setIndex(Math.max(index - 1, 0));
      if (e.key === "Escape") setIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, photos.length, setIndex]);

  if (index === null) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setIndex(null)}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 cursor-pointer" onClick={() => setIndex(null)}>
        <X className="w-6 h-6" />
      </button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 disabled:opacity-30 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); setIndex(Math.max(index - 1, 0)); }}
        disabled={index === 0}
      >
        <ArrowLeft className="w-8 h-8" />
      </button>
      <img src={photos[index]} className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} alt={`Galeri ${index + 1}`} />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 disabled:opacity-30 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); setIndex(Math.min(index + 1, photos.length - 1)); }}
        disabled={index === photos.length - 1}
      >
        <ArrowRight className="w-8 h-8" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-[14px] tracking-widest">
        {index + 1} / {photos.length}
      </div>
    </div>
  );
}

export function Stars({
  rating,
  onChange,
  isEditMode,
  color = "#e0a526",
  size = 16,
}: {
  rating: number;
  onChange: (v: number) => void;
  isEditMode: boolean;
  color?: string;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5" data-editable={isEditMode ? "true" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (isEditMode ? hovered || rating : rating);
        return (
          <Star
            key={star}
            style={{
              width: size,
              height: size,
              cursor: isEditMode ? "pointer" : "default",
              fill: active ? color : "transparent",
              color: active ? color : "#c9c4b8",
            }}
            onMouseEnter={() => isEditMode && setHovered(star)}
            onMouseLeave={() => isEditMode && setHovered(0)}
            onClick={(e) => {
              if (isEditMode) { e.preventDefault(); e.stopPropagation(); onChange(star); }
            }}
          />
        );
      })}
    </div>
  );
}
