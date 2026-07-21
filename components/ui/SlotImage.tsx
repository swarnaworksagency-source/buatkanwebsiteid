"use client";

import { EditableImage } from "@/components/ui/EditableImage";

export interface ImagePos { x: number; y: number; scale: number }

interface Props {
  /** id unik per slot gambar dalam satu template, mis. "hero" / "layanan2" */
  id: string;
  src: string;
  alt: string;
  /** edit mode aktif → gambar bisa digeser & di-zoom */
  em: boolean;
  positions: Record<string, ImagePos>;
  setPos: (id: string, pos: ImagePos) => void;
  /** posisi awal sebelum user menggeser (default tengah) */
  defaultPos?: ImagePos;
  /** true untuk gambar hero (LCP): eager + fetchpriority high */
  priority?: boolean;
  /** class tambahan untuk <img> (mis. filter grayscale + hover) */
  imgClassName?: string;
}

/**
 * Satu slot gambar template yang bisa digeser & di-zoom saat edit mode.
 * Posisi tersimpan di `generated_content.imagePositions[id]`.
 *
 * PENTING: komponen ini harus dipakai dari module scope (jangan bungkus lagi
 * dengan komponen yang didefinisikan di dalam render) — kalau tipe komponennya
 * berubah tiap render, subtree ter-remount dan drag-nya putus di tengah jalan.
 */
export function SlotImage({ id, src, alt, em, positions, setPos, defaultPos, priority, imgClassName }: Props) {
  return (
    <EditableImage
      src={src}
      alt={alt}
      isEditMode={em}
      pos={positions[id] ?? defaultPos}
      onChange={(pos) => setPos(id, pos)}
      priority={priority}
      imgClassName={imgClassName}
    />
  );
}
