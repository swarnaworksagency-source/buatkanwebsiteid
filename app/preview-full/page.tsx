"use client";

import { useEffect, useState } from "react";
import type { TemplateData } from "@/types";
import TemplateSatu from "@/components/templates/jasa/TemplateSatu";
import { Loader2 } from "lucide-react";
import { safeStorage } from "@/lib/storage";

export default function PreviewFullPage() {
  const [data, setData] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = safeStorage.get("zp_preview_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
        
        if (parsed.namaBisnis) {
          document.title = parsed.namaBisnis;
        }
        
        if (parsed.logo) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = parsed.logo;
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-8">
        <h1 className="text-zinc-200 text-xl font-semibold mb-2">
          Tidak ada data preview
        </h1>
        <p className="text-zinc-500 text-sm max-w-md">
          Silakan generate website terlebih dahulu dari dashboard, lalu klik
          tombol &quot;Buka Full View&quot;.
        </p>
      </div>
    );
  }

  return <TemplateSatu {...data} />;
}
