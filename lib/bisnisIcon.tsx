import type { ComponentType } from "react";
import {
  Bird, Egg, Beef, Rabbit, Fish, Bug, Wheat, Sprout, Apple, TreePalm,
  Carrot, Flower2, Coffee, Grape, Shell, type LucideProps,
} from "lucide-react";

type Icon = ComponentType<LucideProps>;

/* ── Ikon custom (lucide belum punya sapi/kambing) — gaya line-art 24px,
   mengikuti currentColor + className/style seperti ikon lucide. ── */
function base(children: React.ReactNode): Icon {
  const C = ({ className, style }: LucideProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      {children}
    </svg>
  );
  return C as Icon;
}

// Kepala sapi: telinga + tanduk + muka + moncong + lubang hidung.
const Cow = base(
  <>
    <path d="M5 9C2.5 8.5 2 6 4 5.5 5.5 5.2 6.4 6 6.6 7.2" />
    <path d="M19 9c2.5-.5 3-3 1-3.5-1.5-.3-2.4.5-2.6 1.7" />
    <path d="M6.5 8.2C6.5 7.2 8.5 7 12 7s5.5.2 5.5 1.2V12c0 3.2-2.4 5.5-5.5 5.5S6.5 15.2 6.5 12Z" />
    <path d="M9 13.5c0-1 6-1 6 0 0 1.8-6 1.8-6 0Z" />
    <path d="M10.6 14.3h.01M13.4 14.3h.01" />
    <path d="M9.5 10.5h.01M14.5 10.5h.01" />
  </>
);

// Kepala kambing: tanduk melengkung ke belakang + muka + janggut.
const Goat = base(
  <>
    <path d="M8 6C6 3.5 4.5 4.5 5.5 6.5 6 7.4 6.8 7.8 7.5 7.8" />
    <path d="M16 6c2-2.5 3.5-1.5 2.5.5-.5.9-1.3 1.3-2 1.3" />
    <path d="M8 8.5C8 7.6 9.8 7.3 12 7.3s4 .3 4 1.2V12c0 3-1.8 5-4 6-2.2-1-4-3-4-6Z" />
    <path d="M11 17.8 10.7 21M13 17.8l.3 3.2" />
    <path d="M10.2 11h.01M13.8 11h.01" />
  </>
);

/* Pemetaan kata kunci "Jenis Usaha" → ikon.
   Ternak → ikon hewannya; tani/kebun → ikon tumbuhannya.
   Urutan penting: yang paling spesifik dulu. */
const RULES: { kata: string[]; icon: Icon }[] = [
  // ── Ternak / hewan ──
  { kata: ["telur", "omega"], icon: Egg },
  { kata: ["ayam", "bebek", "itik", "puyuh", "unggas", "kalkun", "angsa", "burung"], icon: Bird },
  { kata: ["sapi", "kerbau", "lembu", "pedet", "kurban", "qurban"], icon: Cow },
  { kata: ["kambing", "domba", "etawa", "aqiqah"], icon: Goat },
  { kata: ["babi", "potong", "penggemukan", "daging"], icon: Beef },
  { kata: ["kelinci"], icon: Rabbit },
  { kata: ["udang", "lobster", "kepiting", "rajungan", "kerang", "tiram"], icon: Shell },
  { kata: ["ikan", "lele", "nila", "gurame", "mas", "patin", "bawal", "mujair", "gabus", "bandeng", "belut", "sidat", "kerapu", "kakap", "koi", "cupang", "arwana", "tambak", "perikanan"], icon: Fish },
  { kata: ["lebah", "madu", "cacing", "jangkrik", "ulat", "maggot"], icon: Bug },
  // ── Tani / tumbuhan ──
  { kata: ["kopi"], icon: Coffee },
  { kata: ["sawit", "kelapa", "karet", "perkebunan", "kebun"], icon: TreePalm },
  { kata: ["padi", "sawah", "jagung", "gandum", "kedelai", "tebu"], icon: Wheat },
  { kata: ["anggur", "pisang", "nanas", "buah", "durian", "alpukat"], icon: Grape },
  { kata: ["apel", "mangga", "jeruk", "naga"], icon: Apple },
  { kata: ["sayur", "cabai", "umbi", "singkong", "wortel", "hidroponik", "tomat"], icon: Carrot },
  { kata: ["bunga", "hias", "tanaman", "bibit", "benih", "jamur", "pembibitan"], icon: Flower2 },
  // ── Generik (kalau tak ada kata spesifik) ──
  { kata: ["ternak", "peternakan"], icon: Cow },
  { kata: ["tani", "pertanian", "agri", "panen", "organik"], icon: Sprout },
];

/** Ikon default untuk sebuah usaha tani/ternak berdasarkan teks jenis usahanya. */
export function getBisnisIcon(kategori?: string): Icon {
  const k = (kategori || "").toLowerCase();
  for (const r of RULES) {
    if (r.kata.some((w) => k.includes(w))) return r.icon;
  }
  return Sprout; // fallback: tunas (agri generik)
}
