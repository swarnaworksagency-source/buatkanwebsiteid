"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TemplateData, FormData, PaketHarga, ProyekPortofolio, KeahlianItem, PengalamanItem, ProdukItem } from "@/types";
import { getTemplateComponent, getTemplateKategori } from "@/lib/templateRegistry";
import { getPhotoSlots, getTemaTerkunci, usesProdukBuilder } from "@/lib/templates";
import { createClient } from "@/lib/supabase";
import { convertToWebP } from "@/lib/imageUtils";
import { uploadAsset } from "@/lib/uploadAsset";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { safeStorage } from '@/lib/storage';
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { IframePreview } from "@/components/ui/IframePreview";
import {
  Monitor, Smartphone, Loader2, Globe, Pencil,
  ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Eye, PenLine,
  Building2, Phone, AlignLeft, Award, MapPin, Target, Palette,
  Upload, ImagePlus, ExternalLink, Sun, Moon, Check, X, Pipette,
  Plus, Trash2, DollarSign, Camera, ChevronUp, ChevronDown, Star,
  Mail, AtSign, Hash, Type, Rocket, CheckCircle2, AlertCircle
} from "lucide-react";

/* ═══ CONSTANTS ═══ */
// Tahun pengalaman: dropdown dari tahun sekarang mundur ke 1980 (descending).
const TAHUN_OPTIONS = Array.from({ length: new Date().getFullYear() - 1979 }, (_, i) => String(new Date().getFullYear() - i));
const USIA_OPTIONS = ["17-25 tahun", "26-35 tahun", "36-45 tahun", "46-55 tahun", "55+ tahun"];
const STATUS_OPTIONS = ["Lajang", "Menikah", "Menikah dengan anak", "Orang tua tunggal", "Lansia"];
const PEKERJAAN_OPTIONS = ["Pelajar/Mahasiswa", "Karyawan Swasta", "PNS", "Wirausaha", "Ibu Rumah Tangga", "Freelancer", "Profesional (Dokter/Lawyer/dll)"];
const GAYA_HIDUP_OPTIONS = [
  "Suka yang Praktis & Hemat Waktu",
  "Mementingkan Kualitas & Ketahanan",
  "Aktif di Media Sosial",
  "Ibu Rumah Tangga & Keluarga",
  "Pekerja Sibuk & Profesional",
  "Anak Muda & Mahasiswa",
  "Religius & Islami",
  "Peduli Penampilan & Gaya",
  "Suka Belanja Online",
  "Warga Lokal Setia"
];
const STEP_INFO = [
  { label: "Profil Dasar", num: "01" },
  { label: "Detail Bisnis", num: "02" },
  { label: "Visual & Aset", num: "03" },
];
const NUANSA_OPTIONS = [
  { value: "dark" as const, label: "Dark Mode", desc: "Elegan & Mewah", icon: Moon, preview: "bg-zinc-900 border-zinc-700" },
  { value: "light" as const, label: "Light Mode", desc: "Bersih & Terang", icon: Sun, preview: "bg-white border-zinc-200" },
];
const PROFESI_OPTIONS = [
  // Kreatif & Desain
  "UI/UX Designer", "UI Designer", "UX Designer", "UX Researcher", "Desainer Grafis", "Illustrator", "Motion Designer",
  "Animator", "3D Artist", "Product Designer", "Brand Designer", "Logo Designer", "Interior Designer", "Arsitek",
  "Desainer Produk", "Graphic Artist", "Visual Designer", "Concept Artist", "Game Artist", "Comic Artist",
  // Web & Software
  "Programmer", "Software Developer", "Web Developer", "Frontend Developer", "Backend Developer", "Full-Stack Developer",
  "Mobile Developer", "Android Developer", "iOS Developer", "Software Engineer", "Game Developer", "WordPress Developer",
  "No-Code Developer", "DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer", "Security Engineer",
  "Cybersecurity Specialist", "Blockchain Developer", "AI Engineer", "Machine Learning Engineer", "Data Scientist",
  "Data Analyst", "Data Engineer", "Database Administrator", "QA Engineer", "Test Engineer", "System Administrator",
  "Network Engineer", "IT Support", "Technical Writer", "Solution Architect", "Embedded Engineer", "Robotics Engineer",
  // Media & Konten
  "Fotografer", "Videografer", "Content Creator", "Influencer", "YouTuber", "Podcaster", "Streamer", "Editor Video",
  "Penulis", "Copywriter", "Content Writer", "Ghostwriter", "Scriptwriter", "Blogger", "Jurnalis", "Reporter",
  "Translator", "Interpreter", "Voice Over Talent", "Sound Engineer", "Photographer Pre-Wedding", "Drone Pilot",
  // Marketing & Bisnis
  "Digital Marketer", "Social Media Specialist", "Social Media Manager", "SEO Specialist", "SEM Specialist",
  "Ads Specialist", "Performance Marketer", "Marketing Consultant", "Business Consultant", "Business Analyst",
  "Project Manager", "Product Manager", "Program Manager", "Scrum Master", "Brand Strategist", "Growth Hacker",
  "Public Relations", "Sales Executive", "Account Manager", "Account Executive", "Entrepreneur", "Founder",
  "Co-Founder", "CEO", "Startup Founder", "Virtual Assistant", "Customer Service", "Recruiter", "HR Specialist",
  // Edukasi & Pengembangan Diri
  "Guru", "Dosen", "Tutor Privat", "Trainer", "Mentor", "Coach", "Life Coach", "Business Coach", "Public Speaker",
  "Konsultan Pendidikan", "Instruktur", "Peneliti",
  // Kesehatan & Kebugaran
  "Dokter", "Dokter Gigi", "Dokter Hewan", "Psikolog", "Psikiater", "Perawat", "Bidan", "Ahli Gizi", "Nutrisionis",
  "Personal Trainer", "Yoga Instructor", "Pilates Instructor", "Terapis", "Fisioterapis", "Apoteker", "Radiografer",
  // Keuangan & Hukum
  "Akuntan", "Konsultan Pajak", "Financial Planner", "Financial Advisor", "Investor", "Trader", "Aktuaris",
  "Pengacara", "Notaris", "Auditor", "Konsultan Hukum",
  // Beauty, Fashion & Event
  "Make Up Artist", "Hair Stylist", "Beautician", "Nail Artist", "Fashion Designer", "Penjahit", "Stylist",
  "Personal Stylist", "Wedding Organizer", "Event Organizer", "MC / Pembawa Acara", "Dekorator", "Florist",
  // Seni & Hiburan
  "Musisi", "Penyanyi", "Produser Musik", "Music Arranger", "DJ", "Aktor", "Penari", "Koreografer", "Seniman",
  "Pelukis", "Komikus", "Kreator Game",
  // Teknik & Industri
  "Insinyur", "Insinyur Sipil", "Insinyur Mesin", "Insinyur Elektro", "Drafter", "Surveyor", "Quantity Surveyor",
  "Kontraktor", "Mandor", "Teknisi",
  // Lain-lain
  "Chef", "Pastry Chef", "Barista", "Bartender", "Konsultan", "Researcher", "Agen Properti", "Agen Asuransi",
  "Pilot", "Pramugari", "Tour Guide", "Penerjemah", "Freelancer", "Konten Kreator",
];
const INITIAL_FORM: FormData = {
  namaBisnis: "", namaPanggilan: "", tagline: "", kategoriJasa: "", lokasi: "", nomorWhatsApp: "",
  telepon: "", email: "", instagram: "", x_twitter: "", tiktok: "", linkedin: "",
  keunggulan: "", layananSpesifik: [], keahlianList: [], usia: [], statusKeluarga: [], pekerjaan: [], gayaHidup: [], paketHarga: [], produkList: [],
  proyekPortofolio: [],
  pengalaman: [],
  tema: "", primaryColor: "#4f46e5", logo: "", fotoBisnis: [], portofolio: [], portofolioJudul: [],
};
const inputClass = "w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-[13px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all duration-200";
// Format gambar yang diterima: PNG, JPG/JPEG, SVG. Non-SVG auto-convert ke WebP saat upload.
const IMG_ACCEPT = "image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg";
const MAX_PORTOFOLIO = 8;
const EMPTY_PAKET: PaketHarga = { namaPaket: "", harga: "", fitur: [], isPopuler: false };
const EMPTY_PROYEK = (): ProyekPortofolio => ({ namaProyek: "", kategori: "", masalah: "", peran: "", solusi: "", hasil: "", foto: "" });
const EMPTY_PRODUK = (): ProdukItem => ({ nama: "", deskripsi: "", harga: "", foto: "" });
// Saran nama produk untuk usaha tani/ternak desa (builder produk peternakan-001).
const PRODUK_SUGGESTIONS = [
  // Ternak hidup
  "Sapi", "Sapi Potong", "Sapi Perah", "Anakan Sapi (Pedet)", "Kambing", "Kambing Etawa", "Domba",
  // Hewan kurban / aqiqah (dijual musiman, mis. di pinggir jalan jelang Iduladha)
  "Sapi Kurban", "Kambing Kurban", "Domba Kurban", "Hewan Kurban", "Sapi Aqiqah", "Kambing Aqiqah",
  "Ayam Kampung", "Ayam Broiler", "Ayam Petelur", "Bebek", "Itik", "Puyuh", "Kalkun", "Angsa",
  "Kelinci", "DOC (Bibit Ayam)", "Bibit Bebek",
  // Telur
  "Telur Ayam", "Telur Ayam Kampung", "Telur Omega-3", "Telur Bebek", "Telur Asin", "Telur Puyuh",
  // Daging & olahan
  "Daging Sapi", "Daging Kambing", "Daging Ayam", "Daging Bebek", "Karkas Ayam",
  "Sosis & Bakso Daging", "Abon", "Dendeng",
  // Susu
  "Susu Sapi Segar", "Susu Kambing Etawa", "Yogurt", "Keju",
  // Ikan
  "Ikan Lele", "Ikan Nila", "Ikan Gurame", "Ikan Mas", "Ikan Patin", "Udang", "Ikan Asap", "Bibit Ikan",
  // Hasil tani
  "Beras", "Beras Organik", "Jagung", "Sayur Organik", "Cabai", "Tomat", "Buah Segar",
  "Madu Murni", "Kopi", "Kelapa",
  // Sarana
  "Pupuk Organik", "Pupuk Kandang", "Pakan Ternak", "Bibit Tanaman",
];
const EMPTY_KEAHLIAN = (): KeahlianItem => ({ nama: "", deskripsi: "" });
const COUNTRY_CODES = [
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+65", country: "Singapura", flag: "🇸🇬" },
  { code: "+63", country: "Filipina", flag: "🇵🇭" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+855", country: "Kamboja", flag: "🇰🇭" },
  { code: "+95", country: "Myanmar", flag: "🇲🇲" },
  { code: "+673", country: "Brunei", flag: "🇧🇳" },
  { code: "+856", country: "Laos", flag: "🇱🇦" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "Selandia Baru", flag: "🇳🇿" },
  { code: "+1", country: "Amerika Serikat", flag: "🇺🇸" },
  { code: "+44", country: "Inggris", flag: "🇬🇧" },
  { code: "+49", country: "Jerman", flag: "🇩🇪" },
  { code: "+33", country: "Prancis", flag: "🇫🇷" },
  { code: "+31", country: "Belanda", flag: "🇳🇱" },
  { code: "+39", country: "Italia", flag: "🇮🇹" },
  { code: "+34", country: "Spanyol", flag: "🇪🇸" },
  { code: "+966", country: "Arab Saudi", flag: "🇸🇦" },
  { code: "+971", country: "Uni Emirat Arab", flag: "🇦🇪" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "Tiongkok", flag: "🇨🇳" },
  { code: "+81", country: "Jepang", flag: "🇯🇵" },
  { code: "+82", country: "Korea Selatan", flag: "🇰🇷" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+7", country: "Rusia", flag: "🇷🇺" },
  { code: "+90", country: "Turki", flag: "🇹🇷" },
  { code: "+20", country: "Mesir", flag: "🇪🇬" },
  { code: "+27", country: "Afrika Selatan", flag: "🇿🇦" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+52", country: "Meksiko", flag: "🇲🇽" },
];

function BuatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [originalContent, setOriginalContent] = useState<any>(null);
  const [generatedWebsiteId, setGeneratedWebsiteId] = useState<string | null>(null);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save Prompt State
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveActionType, setSaveActionType] = useState<"generate" | "update" | null>(null);
  const [projectName, setProjectName] = useState("");

  // Deploy State
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploySubdomain, setDeploySubdomain] = useState("");
  const [deployStatus, setDeployStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "deploying" | "success" | "error">("idle");

  // Save feedback state
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [websiteSubdomain, setWebsiteSubdomain] = useState<string | null>(null);
  const [deployError, setDeployError] = useState("");

  // Payment State
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [snapToken, setSnapToken] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<{harga: number, isEarlyAdopter: boolean} | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'buatkanweb.id';

  const [isLoading, setIsLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [mobilePanel, setMobilePanel] = useState<"form" | "preview">("form");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const fotoBisnisInputRef = useRef<HTMLInputElement>(null);
  const portofolioInputRef = useRef<HTMLInputElement>(null);

  // Preview desktop: render di lebar VIEWPORT asli (sama seperti /preview-full) lalu
  // scale ke lebar panel. Supaya proporsi (gutter hero, dll) identik dengan /preview-full,
  // bukan beda karena lebar render berbeda. Template pakai container-query (cqw).
  const desktopFrameRef = useRef<HTMLDivElement>(null);
  const desktopContentRef = useRef<HTMLDivElement>(null);
  // Scroll otomatis ke slot proyek baru setelah "Tambah Proyek" (user sering tak sadar slot bertambah).
  const proyekEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollProyek = useRef(false);
  useEffect(() => {
    if (!shouldScrollProyek.current) return;
    shouldScrollProyek.current = false;
    proyekEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [formData.proyekPortofolio.length]);
  const [desktopScale, setDesktopScale] = useState(0.5);
  const [desktopContentHeight, setDesktopContentHeight] = useState(0);
  const [desktopWidth, setDesktopWidth] = useState(1440);
  useEffect(() => {
    const frame = desktopFrameRef.current;
    const content = desktopContentRef.current;
    if (!frame || !content) return;
    const update = () => {
      const vw = window.innerWidth;
      setDesktopWidth(vw);
      const w = frame.clientWidth;
      if (w > 0 && vw > 0) setDesktopScale(w / vw);
      setDesktopContentHeight(content.offsetHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    ro.observe(content);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, [templateData, viewMode]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [waCountryCode, setWaCountryCode] = useState("+62");
  const [showWaDropdown, setShowWaDropdown] = useState(false);
  const [formMode, setFormMode] = useState<"jasa" | "portfolio">("jasa");
  const [proyekFotoFiles, setProyekFotoFiles] = useState<(File | null)[]>([]);
  const [produkFotoFiles, setProdukFotoFiles] = useState<(File | null)[]>([]);

  // File objects store — keeps actual File references for reliable upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fotoBisnisFiles, setFotoBisnisFiles] = useState<(File | null)[]>([]);
  const [portofolioFiles, setPortofolioFiles] = useState<File[]>([]);

  const [kategoriSuggestions, setKategoriSuggestions] = useState<string[]>([]);
  const [layananOptions, setLayananOptions] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('jasa-001');
  const TemplateComponent = getTemplateComponent(selectedTemplateId);

  useEffect(() => {
    const selectedKategori = typeof window !== 'undefined' ? safeStorage.get("selected_kategori") : null;
    const tplId = typeof window !== 'undefined' ? (safeStorage.get("selected_template") || 'jasa-001') : 'jasa-001';
    setSelectedTemplateId(tplId);
    // Semua template kategori 'personal' (personal-001/002/003) pakai formulir portofolio.
    setFormMode(getTemplateKategori(tplId) === 'personal' ? 'portfolio' : 'jasa');

    if (selectedKategori === "fnb") {
      setKategoriSuggestions([
        "Warung Makan", "Rumah Makan Padang", "Warteg & Warung Nasi", "Kedai Kopi & Cafe",
        "Bakso & Mie Ayam", "Soto & Rawon", "Ayam Geprek & Ayam Goreng", "Seafood",
        "Bakery & Roti", "Kue & Snack", "Es & Minuman Segar", "Jus & Smoothie",
        "Bubble Tea & Boba", "Pizza & Pasta", "Burger & Sandwich", "Sushi & Japanese Food",
        "Nasi Goreng & Mie Goreng", "Catering Harian", "Catering Pernikahan", "Katering Kantor",
        "Gorengan & Jajanan", "Martabak", "Pecel & Gado-gado", "Sate & Tongseng",
        "Nasi Uduk & Nasi Kuning", "Frozen Food", "Hampers & Parsel Makanan"
      ]);
      setLayananOptions([
        "Makan di Tempat (Dine In)", "Bawa Pulang (Take Away)", "Pesan Antar (Delivery)",
        "Catering untuk Acara", "Paket Prasmanan", "Paket Nasi Kotak",
        "Pesan via GoFood/GrabFood/ShopeeFood", "Pesan via WhatsApp", "Open PO (Pre-Order)",
        "Paket Keluarga", "Paket Hemat", "Custom Order/Pesanan Khusus",
        "Hampers & Parsel", "Frozen Food (Bisa Dikirim)",
        "Tersedia untuk Arisan & Pengajian", "Tersedia untuk Hajatan & Pernikahan"
      ]);
    } else if (selectedKategori === "kreatif") {
      setKategoriSuggestions([
        "Batik & Tenun", "Kerajinan Bambu", "Kerajinan Rotan", "Kerajinan Kayu",
        "Kerajinan Tanah Liat & Gerabah", "Kerajinan Perak & Emas", "Kerajinan Kulit", "Anyaman & Tas Rajut",
        "Sablon & Merchandise", "Lukisan & Seni Rupa", "Patung & Ukiran", "Kerajinan Batu",
        "Souvenir & Cinderamata", "Boneka & Mainan", "Lilin & Aromaterapi Handmade",
        "Sabun & Kosmetik Handmade", "Buket Bunga & Floral", "Decoupage & Scrapbook",
        "Kaligrafi & Dekorasi Islami", "Fashion & Pakaian Handmade",
        "Aksesoris & Perhiasan Handmade", "Tembikar & Pottery", "Wayang & Kesenian Tradisional"
      ]);
      setLayananOptions([
        "Produk Ready Stock", "Custom Order/Pesanan Khusus", "Ukiran/Tulisan Nama",
        "Tersedia Grosir & Eceran", "Pengiriman ke Seluruh Indonesia", "Bisa COD Area Lokal",
        "Workshop & Pelatihan", "Konsultasi Desain Gratis", "Revisi Desain",
        "Foto Produk Profesional", "Packaging Cantik & Gift Wrap",
        "Tersedia untuk Souvenir Pernikahan", "Tersedia untuk Souvenir Perusahaan",
        "Kolaborasi & Reseller", "Open Dropship"
      ]);
    } else if (selectedKategori === "peternakan") {
      setKategoriSuggestions([
        // Peternakan unggas
        "Peternakan Ayam Petelur", "Peternakan Ayam Broiler", "Peternakan Ayam Kampung", "Peternakan Ayam Organik",
        "Peternakan Bebek & Itik", "Peternakan Puyuh", "Peternakan Kalkun", "Peternakan Angsa",
        "Penetasan Telur (Hatchery)",
        // Produk telur
        "Produksi Telur Ayam", "Produksi Telur Omega-3", "Produksi Telur Bebek & Telur Asin",
        "Produksi Telur Puyuh", "Produksi Telur Ayam Organik",
        // Peternakan ruminansia & besar
        "Peternakan Sapi Perah", "Peternakan Sapi Potong", "Penggemukan Sapi", "Peternakan Kerbau",
        "Peternakan Kambing Perah", "Peternakan Kambing & Domba", "Peternakan Babi", "Peternakan Kuda",
        // Ternak kecil & lain
        "Peternakan Kelinci", "Peternakan Lebah Madu", "Budidaya Cacing", "Budidaya Jangkrik",
        "Peternakan Ulat Hongkong", "Peternakan Burung Kicau", "Peternakan Reptil",
        // Perikanan air tawar
        "Budidaya Ikan Lele", "Budidaya Ikan Nila", "Budidaya Ikan Nila Merah", "Budidaya Ikan Gurame",
        "Budidaya Ikan Mas", "Budidaya Ikan Patin", "Budidaya Ikan Bawal", "Budidaya Ikan Mujair",
        "Budidaya Ikan Gabus", "Budidaya Ikan Bandeng", "Budidaya Ikan Baung", "Budidaya Ikan Tawes",
        "Budidaya Ikan Nilem", "Budidaya Ikan Sepat", "Budidaya Ikan Betutu", "Budidaya Ikan Toman",
        "Budidaya Belut", "Budidaya Sidat", "Budidaya Ikan Sidat",
        // Perikanan air laut & payau
        "Budidaya Ikan Kerapu", "Budidaya Ikan Kakap", "Budidaya Ikan Bandeng Tambak", "Budidaya Udang Vaname",
        "Budidaya Udang Windu", "Budidaya Udang & Tambak", "Budidaya Lobster", "Budidaya Kepiting & Rajungan",
        "Budidaya Kerang & Tiram", "Budidaya Rumput Laut",
        // Ikan hias
        "Budidaya Ikan Hias", "Budidaya Ikan Koi", "Budidaya Ikan Cupang", "Budidaya Ikan Arwana",
        "Budidaya Ikan Louhan", "Budidaya Ikan Guppy", "Budidaya Ikan Mas Koki", "Budidaya Ikan Discus",
        // Pertanian pangan & hortikultura
        "Pertanian Padi & Sawah", "Pertanian Jagung", "Pertanian Kedelai & Kacang", "Pertanian Umbi (Singkong/Ubi)",
        "Pertanian Sayur Organik", "Pertanian Buah", "Pertanian Cabai & Rempah", "Budidaya Jamur",
        "Hidroponik", "Aquaponik", "Pembibitan Tanaman", "Tanaman Hias & Bunga",
        // Perkebunan
        "Perkebunan Kopi", "Perkebunan Teh", "Perkebunan Kakao (Cokelat)", "Perkebunan Kelapa Sawit",
        "Perkebunan Kelapa", "Perkebunan Karet", "Perkebunan Tebu", "Perkebunan Cengkeh",
        "Perkebunan Lada", "Perkebunan Vanili", "Perkebunan Pala", "Perkebunan Kelapa Kopyor",
        "Perkebunan Pisang", "Perkebunan Nanas", "Perkebunan Mangga", "Perkebunan Jeruk",
        "Perkebunan Naga (Buah Naga)", "Perkebunan Alpukat", "Perkebunan Durian",
        // Pendukung & lainnya
        "Toko Pakan Ternak", "Toko Bibit & Benih", "Toko Saprotan (Sarana Pertanian)",
        "Pupuk Organik & Kompos", "Agrowisata", "Kelompok Tani / Gapoktan", "Penggilingan Padi"
      ]);
      setLayananOptions([
        "Jual Hasil Panen Segar", "Produk Ternak (Daging/Susu/Telur)", "Antar Langsung ke Rumah", "Pesan via WhatsApp",
        "Grosir & Eceran", "Paket Langganan Mingguan", "Paket Langganan Bulanan", "Bibit & Benih",
        "Pakan Ternak", "Konsultasi Budidaya", "Kunjungan ke Lokasi/Agrowisata", "Reseller & Dropship",
        "Frozen & Tahan Lama", "Panen Sesuai Pesanan (Pre-Order)", "Produk Organik Bersertifikat", "Pengiriman ke Luar Kota"
      ]);
    } else if (selectedKategori === "personal") {
      setKategoriSuggestions([
        "Freelancer", "Desainer Grafis", "Web Developer", "Fotografer Pribadi", 
        "Content Creator / Influencer", "Konsultan Independen", "Penulis / Blogger", 
        "Tutor / Pengajar Pribadi", "Agen Asuransi / Properti", "Seniman / Ilustrator", 
        "Videografer", "Ahli SEO / Digital Marketer", "Personal Trainer", "Make Up Artist (MUA)"
      ]);
      setLayananOptions([
        "Jasa Desain Custom", "Konsultasi 1-on-1", "Pembuatan Website / Aplikasi", 
        "Pemotretan & Editing", "Endorsement & Kolaborasi", "Pembuatan Artikel / Copywriting", 
        "Sesi Mentoring", "Jasa SEO & Iklan Digital", "Kelas & Kursus Privat", "Makeup & Styling"
      ]);
    } else {
      // Default / "jasa"
      setKategoriSuggestions([
        "Servis AC & Elektronik", "Bengkel Motor & Mobil", "Salon & Barbershop", "Laundry & Dry Cleaning",
        "Fotografer & Videografer", "Katering & Nasi Box", "Jasa Kebersihan & Cleaning Service",
        "Les Privat & Bimbel", "Konsultan Bisnis", "Desain Grafis & Percetakan", "Jasa Antar & Kurir",
        "Tukang & Renovasi Rumah", "Wedding Organizer", "Event Organizer", "Jasa Jahit & Konveksi",
        "Studio Foto", "Jasa Titip (Jastip)", "Travel Agent", "Spa & Refleksi",
        "Klinik Kecantikan", "Klinik Kesehatan", "Dokter Praktek", "Bidan & Dukun Beranak",
        "Pengacara & Notaris", "Akuntan & Pajak", "Rental Kendaraan", "Parkir & Titip Motor",
        "Jasa Cuci Sofa & Kasur", "Jasa Las & Bubut", "Jasa Print & Fotocopy"
      ]);
      setLayananOptions([
        "Servis Panggilan ke Rumah", "Servis di Tempat/Workshop", "Konsultasi Gratis", "Garansi Pengerjaan",
        "Antar Jemput Barang", "Instalasi & Pemasangan", "Perawatan Berkala/Servis Rutin",
        "Pembersihan & Cuci", "Perbaikan Darurat 24 Jam", "Desain & Perencanaan", "Pelatihan & Edukasi",
        "Dokumentasi Foto & Video", "Dekorasi & Penataan", "Pengiriman ke Seluruh Indonesia",
        "Layanan COD", "Konsultasi Online via WA", "Kunjungan ke Lokasi", "Paket Bulanan",
        "Paket Tahunan", "Member & Langganan"
      ]);
    }
  }, []);

  useEffect(() => {
    const selectedKategori = typeof window !== 'undefined' ? safeStorage.get("selected_kategori") : null;
    if (selectedKategori === "fnb" || selectedKategori === "kreatif" || selectedKategori === "peternakan") return;

    const kat = formData.kategoriJasa.toLowerCase();
    const isFoto = kat.includes("fotografi") || kat.includes("foto");
    const isVideo = kat.includes("videografi") || kat.includes("video");

    const fotoOptions = [
      "Foto Pernikahan (Wedding)", "Foto Prewedding", "Foto Wisuda & Graduation",
      "Foto Produk untuk Online Shop", "Foto Makanan (Food Photography)", "Foto Fashion & Model",
      "Foto Keluarga & Newborn", "Foto Ulang Tahun & Sweet 17", "Foto Event & Seminar",
      "Foto Profil Perusahaan (Company Profile)", "Foto Arsitektur & Interior",
      "Foto Headshot & Personal Branding", "Foto Katalog Produk", "Foto Dokumentasi Acara Kantor",
      "Sewa Studio Foto per Jam", "Editing & Retouching Foto", "Cetak Foto & Album"
    ];

    const videoOptions = [
      "Video Pernikahan (Wedding Cinematography)", "Video Prewedding",
      "Video Profil Perusahaan (Company Profile)", "Video Iklan & Promosi Produk",
      "Video Konten Media Sosial (Reels/TikTok)", "Video Dokumentasi Event & Seminar",
      "Video Wisuda & Graduation", "Video Ulang Tahun & Sweet 17",
      "Video Tutorial & Edukasi", "Video Testimoni Pelanggan", "Video Drone (Aerial)",
      "Video Music & Cover Song", "Live Streaming Event", "Editing Video",
      "Motion Graphic & Animasi", "Video After Movie"
    ];

    if (isFoto && isVideo) {
      setLayananOptions([...fotoOptions, ...videoOptions]);
    } else if (isFoto) {
      setLayananOptions(fotoOptions);
    } else if (isVideo) {
      setLayananOptions(videoOptions);
    } else {
      setLayananOptions([
        "Servis Panggilan ke Rumah", "Servis di Tempat/Workshop", "Konsultasi Gratis", "Garansi Pengerjaan",
        "Antar Jemput Barang", "Instalasi & Pemasangan", "Perawatan Berkala/Servis Rutin",
        "Pembersihan & Cuci", "Perbaikan Darurat 24 Jam", "Desain & Perencanaan", "Pelatihan & Edukasi",
        "Dokumentasi Foto & Video", "Dekorasi & Penataan", "Pengiriman ke Seluruh Indonesia",
        "Layanan COD", "Konsultasi Online via WA", "Kunjungan ke Lokasi", "Paket Bulanan",
        "Paket Tahunan", "Member & Langganan"
      ]);
    }
  }, [formData.kategoriJasa]);

  // Auth check — redirect to login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (idParam && authChecked) {
      loadWebsiteData(idParam);
    }
  }, [idParam, authChecked]);

  const loadWebsiteData = async (id: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/dashboard');
        return;
      }
      const { data, error } = await supabase.from('websites')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      // Pulihkan template dari kolom template_id website (bukan dari localStorage yang bisa basi).
      // Tanpa ini, preview/edit website portofolio bisa salah render jadi template jasa.
      const loadedTemplateId = data.template_id || 'jasa-001';
      setSelectedTemplateId(loadedTemplateId);
      setFormMode(getTemplateKategori(loadedTemplateId) === 'personal' ? 'portfolio' : 'jasa');

      const loadedFormData = data.generated_content?.__formData || {
        ...INITIAL_FORM,
        namaBisnis: data.nama_usaha || "",
        tagline: data.deskripsi || "",
        kategoriJasa: data.kategori || "",
        logo: data.logo_url || "",
        portofolio: data.foto_urls || [],
      };

      // Always override image fields with actual uploaded URLs from DB.
      // The __formData may contain stale blob: URLs from the original form session.
      loadedFormData.logo = data.logo_url || "";
      loadedFormData.portofolio = data.foto_urls || [];
      loadedFormData.fotoBisnis = data.generated_content?.fotoBisnis || [];
      // Guard field baru untuk website lama yang __formData-nya belum punya array-array ini.
      if (!Array.isArray(loadedFormData.keahlianList)) loadedFormData.keahlianList = [];
      if (!Array.isArray(loadedFormData.proyekPortofolio)) loadedFormData.proyekPortofolio = [];
      if (!Array.isArray(loadedFormData.pengalaman)) loadedFormData.pengalaman = [];
      if (!Array.isArray(loadedFormData.portofolioJudul)) loadedFormData.portofolioJudul = [];
      if (!Array.isArray(loadedFormData.produkList)) loadedFormData.produkList = [];

      setFormData(loadedFormData);
      // Slot file foto produk sejajar jumlah produk (semua null; foto lama sudah berupa URL).
      setProdukFotoFiles(new Array(loadedFormData.produkList.length).fill(null));

      setTemplateData({
        ...data.generated_content,
        namaBisnis: data.generated_content?.namaBisnis || data.nama_usaha || "",
        kategori: data.generated_content?.kategori || data.kategori || "",
        lokasi: data.generated_content?.lokasi || loadedFormData.lokasi || "",
        kontak: data.generated_content?.kontak || { wa: loadedFormData.nomorWhatsApp, telepon: loadedFormData.telepon, email: loadedFormData.email },
        sosmed: data.generated_content?.sosmed || { instagram: loadedFormData.instagram, tiktok: loadedFormData.tiktok, twitter: loadedFormData.x_twitter },
        warna: data.generated_content?.warna || { primary: loadedFormData.primaryColor, tema: loadedFormData.tema || "light" },
        paketHarga: data.generated_content?.paketHarga || loadedFormData.paketHarga || [],
        logo: data.logo_url || "",
        portofolio: data.foto_urls || [],
        portofolioJudul: data.generated_content?.portofolioJudul || [],
        fotoBisnis: data.generated_content?.fotoBisnis || [],
      });
      setOriginalContent(data.generated_content);
      setGeneratedWebsiteId(data.id);
      setWebsiteSubdomain(data.subdomain || null);
      setStep(2); // Go to Visual step
    } catch (err) {
      console.error("Failed to load website", err);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce subdomain validation
  useEffect(() => {
    if (!showDeployModal || deployStatus === 'success') return;
    
    if (deploySubdomain.length < 3) {
      setDeployStatus('idle');
      return;
    }

    const checkSubdomain = async () => {
      setDeployStatus('checking');
      try {
        const res = await fetch(`/api/check-subdomain?subdomain=${deploySubdomain}`);
        const data = await res.json();
        
        if (data.available) {
          setDeployStatus('available');
        } else {
          setDeployStatus('unavailable');
          setDeployError(data.error || 'Subdomain tidak tersedia');
        }
      } catch (err) {
        setDeployStatus('error');
        setDeployError('Gagal mengecek subdomain');
      }
    };

    const timer = setTimeout(checkSubdomain, 500);
    return () => clearTimeout(timer);
  }, [deploySubdomain, showDeployModal]);

  const deployWebsite = async (subdomain: string, websiteId: string) => {
    setDeployStatus('deploying');
    try {
      const supabase = createClient();

      if (templateData) {
        // Pakai __formData bersih yang sudah tersimpan saat generate/simpan (URL sudah
        // ter-upload) supaya foto produk/fotoBisnis tidak tertimpa blob mati dari state.
        const { data: cur } = await supabase
          .from('websites')
          .select('generated_content')
          .eq('id', websiteId)
          .single();
        const storedForm = cur?.generated_content?.__formData;
        const cleanFormData = storedForm
          ? { ...storedForm, logo: templateData.logo || storedForm.logo, portofolio: templateData.portofolio || storedForm.portofolio }
          : { ...formData, logo: templateData.logo || formData.logo, portofolio: templateData.portofolio || formData.portofolio };
        const latestContent = { ...templateData, __formData: cleanFormData };
        const { error: contentError } = await supabase
          .from('websites')
          .update({ 
            generated_content: latestContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', websiteId);

        if (contentError) throw contentError;
      }

      // Aktivasi authoritative di server (verifikasi paid + validasi subdomain).
      // Jangan set status 'active'/subdomain dari client (diblokir trigger DB guard).
      const res = await fetch('/api/website/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, subdomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal deploy. Coba lagi.');
      setDeployStatus('success');
    } catch (err: any) {
      setDeployStatus('error');
      setDeployError(err.message || "Gagal deploy website");
    }
  };

  const startPayment = async (subdomain: string, websiteId: string) => {
    setPaymentLoading(true);
    try {
      // Subdomain disimpan & divalidasi server di /api/payment/create (service role).
      // Client TIDAK boleh menulis kolom subdomain (diblokir trigger DB guard).
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, subdomain })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment');
      
      setSnapToken(data.paymentUrl);
      setPaymentInfo({ harga: data.harga, isEarlyAdopter: data.isEarlyAdopter });
      setShowPaymentModal(true);
    } catch (err: any) {
      setDeployStatus('error');
      setDeployError(err.message || "Gagal memulai pembayaran. Coba lagi.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (deployStatus !== 'available' || !generatedWebsiteId) return;
    
    setDeployStatus('deploying');
    try {
      const supabase = createClient();
      const { data: existingPayment, error } = await supabase
        .from('payments')
        .select('id, status')
        .eq('website_id', generatedWebsiteId)
        .eq('status', 'paid')
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;

      if (existingPayment) {
        await deployWebsite(deploySubdomain, generatedWebsiteId);
      } else {
        await startPayment(deploySubdomain, generatedWebsiteId);
      }
    } catch (err: any) {
      setDeployStatus('error');
      setDeployError(err.message || "Gagal memeriksa pembayaran");
    }
  };

  const handleBayarSekarang = () => {
    if (snapToken) {
      // Redirect ke halaman Duitku
      window.location.href = snapToken;
    } else {
      alert('Gagal memuat halaman pembayaran. Silakan coba lagi.');
    }
  };

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }, []
  );

  // Kebutuhan foto template terpilih (lib/templates.ts). null = template belum punya slot bernama.
  const photoSpec = getPhotoSlots(selectedTemplateId);
  // Copy formulir menyesuaikan jenis template (jasa vs peternakan/agri) supaya
  // labelnya relevan — mis. "Kategori Jasa" tidak cocok untuk usaha tani/ternak.
  const isPeternakan = getTemplateKategori(selectedTemplateId) === "peternakan";
  // Template ini pakai builder produk manual (foto+nama+deskripsi+harga) di step 2.
  const usesBuilder = usesProdukBuilder(selectedTemplateId);
  const cpy = isPeternakan
    ? {
        namaLabel: "Nama Usaha",
        namaPlaceholder: "contoh: Tani Makmur Farm",
        taglinePlaceholder: "contoh: Hasil Tani & Ternak Segar Langsung dari Kebun",
        kategoriLabel: "Jenis Usaha",
        kategoriPlaceholder: "contoh: Peternakan Ayam Petelur",
        keunggulanPlaceholder: "contoh: Organik tanpa bahan kimia, panen tiap hari, antar langsung ke rumah...",
        layananLabel: "Produk & Layanan",
      }
    : {
        namaLabel: "Nama Bisnis",
        namaPlaceholder: "contoh: Sejuk Prima AC",
        taglinePlaceholder: "contoh: Solusi AC Terpercaya untuk Kenyamanan Anda",
        kategoriLabel: "Kategori Jasa",
        kategoriPlaceholder: "contoh: Servis AC",
        keunggulanPlaceholder: "contoh: Berpengalaman 10 tahun, garansi 30 hari, teknisi bersertifikat...",
        layananLabel: "Layanan Spesifik",
      };
  // Template berpalet terkunci (mis. jasa-002 "Neon" yang selalu gelap): pilihan
  // Nuansa Desain disembunyikan dan temanya diisi otomatis.
  const temaTerkunci = getTemaTerkunci(selectedTemplateId);
  const maxPortofolio = photoSpec?.portofolio?.max ?? MAX_PORTOFOLIO;

  useEffect(() => {
    if (temaTerkunci && formData.tema !== temaTerkunci) updateField("tema", temaTerkunci);
  }, [temaTerkunci, formData.tema, updateField]);

  const canProceed = (): boolean => {
    if (step === 0) {
      if (formMode === "portfolio")
        return !!(formData.namaBisnis.trim() && formData.tagline.trim() && formData.lokasi && formData.nomorWhatsApp.trim());
      return !!(formData.namaBisnis.trim() && formData.kategoriJasa.trim() && formData.lokasi && formData.nomorWhatsApp.trim());
    }
    if (step === 1) {
      if (formMode === "portfolio")
        return formData.keahlianList.some((k) => k.nama.trim()) && formData.proyekPortofolio.some((p) => !!p.foto);
      // Template dengan builder produk: wajib minimal 1 produk berisi nama (produk
      // menggantikan input "Layanan Spesifik"); demografi target tetap wajib.
      const produkOk = usesBuilder
        ? formData.produkList.some((pr) => pr.nama.trim())
        : formData.layananSpesifik.length > 0;
      return !!(
        produkOk &&
        formData.keunggulan.trim() &&
        formData.usia.length > 0 &&
        formData.statusKeluarga.length > 0 &&
        formData.pekerjaan.length > 0 &&
        formData.gayaHidup.length > 0
      );
    }
    // Mode portfolio: Nuansa (tema) disembunyikan & tidak dipakai template personal,
    // jadi step 3 tidak mensyaratkannya. Mode jasa tetap wajib pilih tema.
    if (step === 2) {
      // Template dengan slot foto bernama: semua slot wajib harus terisi,
      // plus minimal sekian foto produk bila template memintanya.
      if (photoSpec) {
        const slotOk = photoSpec.slots.every((sl) => !sl.wajib || !!formData.fotoBisnis[sl.idx]);
        const minPorto = photoSpec.portofolio?.min ?? 0;
        const portoOk = formData.portofolio.filter(Boolean).length >= minPorto;
        return slotOk && portoOk && (formMode === "portfolio" || !!temaTerkunci || !!formData.tema);
      }
      return formMode === "portfolio" || !!temaTerkunci ? true : !!formData.tema;
    }
    return false;
  };

  /* ── File Upload Handlers ── */
  const handleLogoSelect = (file: File) => {
    if (formData.logo) URL.revokeObjectURL(formData.logo);
    setLogoFile(file);
    updateField("logo", URL.createObjectURL(file));
  };
  const handleLogoRemove = () => {
    if (formData.logo) URL.revokeObjectURL(formData.logo);
    setLogoFile(null);
    updateField("logo", "");
  };
  const handlePhotosSelect = (files: FileList, field: "fotoBisnis" | "portofolio") => {
    let fileArray = Array.from(files);
    // Batasi portofolio maksimal MAX_PORTOFOLIO slot
    if (field === "portofolio") {
      const sisa = maxPortofolio - formData.portofolio.length;
      if (sisa <= 0) return;
      fileArray = fileArray.slice(0, sisa);
    }
    const newUrls = fileArray.map((f) => URL.createObjectURL(f));
    if (field === "fotoBisnis") setFotoBisnisFiles(prev => [...prev, ...fileArray]);
    else setPortofolioFiles(prev => [...prev, ...fileArray]);
    updateField(field, [...formData[field], ...newUrls]);
  };
  // Slot foto bernama (mode portfolio): fotoBisnis[0] = Hero, fotoBisnis[1] = Profil
  const handleFotoBisnisSlot = (index: number, file: File) => {
    const old = formData.fotoBisnis[index];
    if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
    const url = URL.createObjectURL(file);
    setFotoBisnisFiles((prev) => { const next = [...prev]; while (next.length <= index) next.push(null); next[index] = file; return next; });
    setFormData((prev) => {
      const arr = [...prev.fotoBisnis];
      while (arr.length <= index) arr.push("");
      arr[index] = url;
      return { ...prev, fotoBisnis: arr };
    });
  };
  const removeFotoBisnisSlot = (index: number) => {
    const old = formData.fotoBisnis[index];
    if (old && old.startsWith("blob:")) URL.revokeObjectURL(old);
    setFotoBisnisFiles((prev) => { const next = [...prev]; if (next[index] !== undefined) next[index] = null; return next; });
    setFormData((prev) => { const arr = [...prev.fotoBisnis]; if (arr[index] !== undefined) arr[index] = ""; return { ...prev, fotoBisnis: arr }; });
  };
  // Judul foto galeri — index sejajar dengan formData.portofolio.
  const setPortofolioJudul = (index: number, value: string) => {
    setFormData((prev) => {
      const arr = [...(prev.portofolioJudul || [])];
      while (arr.length <= index) arr.push("");
      arr[index] = value;
      return { ...prev, portofolioJudul: arr };
    });
  };

  const handlePhotoRemove = (index: number, field: "fotoBisnis" | "portofolio") => {
    URL.revokeObjectURL(formData[field][index]);
    if (field === "fotoBisnis") setFotoBisnisFiles(prev => prev.filter((_, i) => i !== index));
    else {
      setPortofolioFiles(prev => prev.filter((_, i) => i !== index));
      // Judul ikut terhapus supaya index judul tetap sejajar dengan foto.
      setFormData((prev) => ({ ...prev, portofolioJudul: (prev.portofolioJudul || []).filter((_, i) => i !== index) }));
    }
    updateField(field, formData[field].filter((_, i) => i !== index));
  };
  const handleDrop = (e: React.DragEvent, type: "logo" | "fotoBisnis" | "portofolio") => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    if (type === "logo") handleLogoSelect(files[0]);
    else handlePhotosSelect(files, type);
  };

  /* ── Paket Harga Handlers ── */
  const addPaket = () => updateField("paketHarga", [...formData.paketHarga, { ...EMPTY_PAKET }]);
  const removePaket = (index: number) => updateField("paketHarga", formData.paketHarga.filter((_, i) => i !== index));
  const updatePaket = (index: number, key: keyof PaketHarga, value: string | string[] | boolean) => {
    const updated = formData.paketHarga.map((p, i) => i === index ? { ...p, [key]: value } : p);
    updateField("paketHarga", updated);
  };
  const movePaketUp = (index: number) => {
    if (index === 0) return;
    const arr = [...formData.paketHarga];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    updateField("paketHarga", arr);
  };
  const movePaketDown = (index: number) => {
    if (index >= formData.paketHarga.length - 1) return;
    const arr = [...formData.paketHarga];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    updateField("paketHarga", arr);
  };
  const togglePopuler = (index: number) => {
    const updated = formData.paketHarga.map((p, i) => ({ ...p, isPopuler: i === index ? !p.isPopuler : false }));
    updateField("paketHarga", updated);
  };

  /* ── Keahlian Handlers (mode portfolio) ── */
  const addKeahlian = () => updateField("keahlianList", [...formData.keahlianList, EMPTY_KEAHLIAN()]);
  const removeKeahlian = (index: number) => updateField("keahlianList", formData.keahlianList.filter((_, i) => i !== index));
  const updateKeahlian = (index: number, key: keyof KeahlianItem, value: string) => {
    updateField("keahlianList", formData.keahlianList.map((k, i) => i === index ? { ...k, [key]: value } : k));
  };

  /* ── Pengalaman Handlers (mode portfolio, template personal-002/003) ── */
  const addPengalaman = () => updateField("pengalaman", [...formData.pengalaman, { kategori: "pekerjaan", tahun: "", judul: "", deskripsi: "" } as PengalamanItem]);
  const removePengalaman = (index: number) => updateField("pengalaman", formData.pengalaman.filter((_, i) => i !== index));
  const updatePengalaman = (index: number, key: keyof PengalamanItem, value: string) => {
    updateField("pengalaman", formData.pengalaman.map((p, i) => i === index ? ({ ...p, [key]: value } as PengalamanItem) : p));
  };

  /* ── Proyek Portofolio Handlers ── */
  const addProyek = () => {
    updateField("proyekPortofolio", [...formData.proyekPortofolio, EMPTY_PROYEK()]);
    setProyekFotoFiles((prev) => [...prev, null]);
    shouldScrollProyek.current = true; // scroll ke slot baru setelah render (lihat useEffect)
  };
  const removeProyek = (index: number) => {
    updateField("proyekPortofolio", formData.proyekPortofolio.filter((_, i) => i !== index));
    setProyekFotoFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const updateProyek = (index: number, key: keyof ProyekPortofolio, value: string) => {
    const updated = formData.proyekPortofolio.map((p, i) => i === index ? { ...p, [key]: value } : p);
    updateField("proyekPortofolio", updated);
  };
  const handleProyekFoto = (index: number, file: File) => {
    const url = URL.createObjectURL(file);
    setProyekFotoFiles((prev) => { const next = [...prev]; next[index] = file; return next; });
    updateProyek(index, "foto", url);
  };
  const removeProyekFoto = (index: number) => {
    if (formData.proyekPortofolio[index]?.foto) URL.revokeObjectURL(formData.proyekPortofolio[index].foto);
    setProyekFotoFiles((prev) => { const next = [...prev]; next[index] = null; return next; });
    updateProyek(index, "foto", "");
  };

  /* ── Produk Builder Handlers (template peternakan/agri) ── */
  const addProduk = () => {
    updateField("produkList", [...formData.produkList, EMPTY_PRODUK()]);
    setProdukFotoFiles((prev) => [...prev, null]);
  };
  const removeProduk = (index: number) => {
    if (formData.produkList[index]?.foto?.startsWith("blob:")) URL.revokeObjectURL(formData.produkList[index].foto);
    updateField("produkList", formData.produkList.filter((_, i) => i !== index));
    setProdukFotoFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const updateProduk = (index: number, key: keyof ProdukItem, value: string) => {
    updateField("produkList", formData.produkList.map((pr, i) => i === index ? { ...pr, [key]: value } : pr));
  };
  const handleProdukFoto = (index: number, file: File) => {
    const old = formData.produkList[index]?.foto;
    if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
    setProdukFotoFiles((prev) => { const next = [...prev]; while (next.length <= index) next.push(null); next[index] = file; return next; });
    updateProduk(index, "foto", URL.createObjectURL(file));
  };

  const handleDiscardAndBack = async () => {
    if (generatedWebsiteId && !idParam) {
      const supabase = createClient();
      await supabase.from('websites').delete().eq('id', generatedWebsiteId);
    }
    router.push(idParam ? '/dashboard' : '/dashboard/template');
  };

  const handleSaveAndBack = () => {
    router.push('/dashboard');
  };

  const handleGenerate = async () => {
    if (!canProceed()) return;
    setIsLoading(true); setIsBuilding(true); setError("");
    setShowSavePrompt(false);
    
    abortControllerRef.current = new AbortController();

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Anda harus login untuk generate website.");
      }

      // 1. Cleanup expired preview websites
      await supabase
        .from('websites')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'preview')
        .lt('expires_at', new Date().toISOString());

      // 2. Check total capacity limit (max 6 websites)
      const { count: totalWebsites } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (totalWebsites && totalWebsites >= 6) {
        throw new Error("Kamu sudah memiliki 6 website. Hapus salah satu website preview untuk membuat yang baru.");
      }

      // 3. Check daily quota from generate_logs (max 3/day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: generatedTodayCount, error: quotaError } = await supabase
        .from('generate_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      if (quotaError) throw new Error("Gagal mengecek kuota.");
      if ((generatedTodayCount ?? 0) >= 3) {
        throw new Error("Batas generate harian tercapai. Kamu sudah generate 3 website hari ini. Coba lagi besok setelah pukul 00.00 WIB.");
      }

      // Upload via helper dgn token user eksplisit (hindari regresi propagasi token SDK).
      const uploadFile = async (file: File, folder: string) => {
        try {
          return await uploadAsset(supabase, file, folder, user.id);
        } catch (e: any) {
          console.error("Upload error:", e);
          throw new Error(`Gagal upload gambar (${folder}). Detail: ${e.message || 'Kesalahan tidak diketahui'}.`);
        }
      };

      // Optimize images before upload
      setIsOptimizing(true);
      const optimizedLogo = logoFile ? await convertToWebP(logoFile, 0.9).catch(() => logoFile) : null;
      setIsOptimizing(false);

      let logoUrl = "";
      if (optimizedLogo) {
        logoUrl = await uploadFile(optimizedLogo, 'logos');
      } else if (formData.logo && !formData.logo.startsWith('blob:')) {
        logoUrl = formData.logo; // Already uploaded URL
      }

      // Sumber foto portofolio: mode portfolio → foto proyek (step 2); selain itu → upload portofolio (step 3).
      // Mode portfolio: hanya proyek yg punya foto — supaya urutan portofolio[i] sejajar layanan[i] (judul dari AI).
      const proyekWithFoto = formData.proyekPortofolio
        .map((p, i) => ({ p, file: proyekFotoFiles[i] || null }))
        .filter((e) => !!e.p.foto);
      const portoSource = formMode === "portfolio"
        ? proyekWithFoto.map((e) => ({ url: e.p.foto, file: e.file }))
        : formData.portofolio.map((url, i) => ({ url, file: portofolioFiles[i] || null }));

      const portofolioUrls = (await Promise.all(portoSource.map(async ({ url, file }) => {
        if (url && url.startsWith('blob:') && file) {
          const opt = await convertToWebP(file, 0.85).catch(() => file);
          return await uploadFile(opt, 'portofolio');
        } else if (url && !url.startsWith('blob:')) {
          return url; // Already uploaded URL
        }
        return "";
      }))).filter(url => url !== "");

      // Foto bisnis (slot bernama: [0]=Hero, [1]=Profil). Pertahankan index — JANGAN filter "".
      const fotoBisnisUploadPromises = formData.fotoBisnis.map(async (url, i) => {
        if (url && url.startsWith('blob:') && fotoBisnisFiles[i]) {
          const opt = await convertToWebP(fotoBisnisFiles[i]!, 0.85).catch(() => fotoBisnisFiles[i]!);
          return await uploadFile(opt, 'foto-bisnis');
        } else if (url && !url.startsWith('blob:')) {
          return url;
        }
        return "";
      });
      const fotoBisnisUrls = await Promise.all(fotoBisnisUploadPromises);

      // Builder produk (template peternakan): upload foto tiap produk, lalu produk
      // (nama+deskripsi+harga) & fotonya jadi sumber section Produk — bukan hasil AI.
      const produkUrls = usesBuilder ? await Promise.all(formData.produkList.map(async (pr, i) => {
        const f = produkFotoFiles[i] || null;
        if (pr.foto && pr.foto.startsWith('blob:') && f) { const opt = await convertToWebP(f, 0.85).catch(() => f); return await uploadFile(opt, 'portofolio'); }
        if (pr.foto && !pr.foto.startsWith('blob:')) return pr.foto;
        return "";
      })) : [];
      const produkTerisi = usesBuilder
        ? formData.produkList.map((pr, i) => ({ pr, url: produkUrls[i] || "" })).filter((e) => e.pr.nama.trim())
        : [];
      const produkLayanan = produkTerisi.map((e) => ({ nama: e.pr.nama, deskripsi: e.pr.deskripsi, harga: e.pr.harga }));
      const produkFoto = produkTerisi.map((e) => e.url);
      const produkListClean = formData.produkList.map((pr, i) => ({ ...pr, foto: produkUrls[i] ?? pr.foto }));

      // Call API — mode portfolio kirim hanya proyek berfoto (urut sejajar dgn portofolioUrls)
      // Keahlian terisi (nama wajib). Dikirim utuh (nama+deskripsi) supaya AI bisa
      // meringkas deskripsi yang ditulis bebas-panjang oleh user jadi padat.
      const keahlianTerisi = formData.keahlianList.filter((k) => k.nama.trim());
      const apiBody = formMode === "portfolio"
        ? { ...formData, proyekPortofolio: proyekWithFoto.map((e) => e.p), layananSpesifik: keahlianTerisi.map((k) => k.nama), keahlian: keahlianTerisi }
        : usesBuilder
          ? { ...formData, layananSpesifik: produkLayanan.map((l) => l.nama) }
          : formData;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiBody),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Gagal mengenerate website. Coba lagi.");
      }

      if (!res.body) throw new Error("Tidak ada stream dari server.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamData = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamData += decoder.decode(value, { stream: true });
      }

      // Server menandai kegagalan AI lewat marker. Pesan generik (tak perlu detail token).
      if (streamData.includes("__GENERATE_ERROR__")) {
        throw new Error("Gagal generate website. Coba lagi sebentar lagi.");
      }

      let aiData;
      try {
        let jsonString = streamData.trim();
        const jsonMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1].trim();
        }
        aiData = JSON.parse(jsonString);
      } catch (err) {
        console.error("Parse error on stream data:", streamData);
        throw new Error("Format respons dari AI tidak valid.");
      }

      const finalData: TemplateData = {
        hero: aiData.hero || { headline: "", subheadline: "", ctaText: "" },
        about: aiData.about || { judul: "", deskripsi: "", keunggulan: [] },
        layanan: usesBuilder ? produkLayanan : (aiData.layanan || []),
        targetPelanggan: aiData.targetPelanggan || { deskripsi: "", painPoint: "", solusi: "" },
        testimonialPlaceholder: aiData.testimonialPlaceholder || [],
        footer: aiData.footer || { tagline: "", ctaText: "" },

        namaBisnis: formData.namaBisnis,
        namaPanggilan: formData.namaPanggilan,
        kategori: formData.kategoriJasa,
        lokasi: formData.lokasi,

        kontak: {
          wa: formData.nomorWhatsApp,
          telepon: formData.telepon,
          email: formData.email,
        },
        sosmed: {
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          twitter: formData.x_twitter,
        },
        warna: {
          primary: formData.primaryColor,
          tema: (formData.tema || "light") as "dark" | "light",
        },

        paketHarga: formData.paketHarga,
        // Deskripsi keahlian sudah DIRINGKAS AI (urut & jumlah sejajar keahlianTerisi yg
        // dikirim ke API). nama apa adanya dari user. Fallback ke deskripsi mentah kalau
        // AI tak mengembalikan keahlian.
        keahlian: keahlianTerisi.map((k, i) => ({
          nama: k.nama,
          deskripsi: (Array.isArray(aiData.keahlian) ? aiData.keahlian[i]?.deskripsi?.trim() : "") || k.deskripsi,
        })),
        pengalaman: formData.pengalaman.filter((p) => p.judul.trim()),
        logo: logoUrl,
        // Builder produk: foto produk jadi portofolio (sejajar layanan), bukan upload galeri.
        portofolio: usesBuilder ? produkFoto : portofolioUrls,
        portofolioJudul: formData.portofolioJudul || [],
        fotoBisnis: fotoBisnisUrls,
      };
      const portofolioFinal = usesBuilder ? produkFoto : portofolioUrls;

      // Save to DB
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      const templateId = safeStorage.get('selected_template') || 'jasa-001';

      let dbData, dbError;

      // Kolom sensitif (status/subdomain/expires_at) HANYA boleh diubah server
      // (trigger DB guard_websites_protected_cols, before update). Karena itu:
      // - insert baru: sertakan status/expires_at (trigger tak jalan saat insert).
      // - update (edit/regenerate): JANGAN kirim kolom sensitif → hindari 403.
      const payload = {
        user_id: user.id,
        nama_usaha: projectName || formData.namaBisnis || "Website Baru",
        deskripsi: formData.tagline || aiData.hero?.subheadline || "",
        kategori: formData.kategoriJasa,
        logo_url: logoUrl,
        foto_urls: portofolioFinal,
        generated_content: { ...finalData, __formData: { ...formData, logo: logoUrl, portofolio: portofolioFinal, produkList: produkListClean, fotoBisnis: fotoBisnisUrls } },
        template_id: templateId,
      };

      if (idParam) {
        const { data, error } = await supabase.from('websites').update(payload).eq('id', idParam).select('id').single();
        dbData = data; dbError = error;
      } else {
        const { data, error } = await supabase.from('websites').insert({
          ...payload,
          status: 'preview',
          expires_at: expiresAt.toISOString(),
        }).select('id').single();
        dbData = data; dbError = error;
      }

      if (dbError) {
        console.error("DB Error:", dbError);
        throw new Error("Gagal menyimpan data website ke database.");
      }

      if (dbData?.id) {
        setGeneratedWebsiteId(dbData.id);
        // generate_logs kini dicatat server-side di /api/generate (enforcement kuota
        // pindah ke server). Tidak insert dari client lagi agar tidak dobel hitung.
      }

      setTemplateData(finalData);

      // Show building animation for a few seconds if stream finishes too quickly
      // Now that we have streaming, we don't need artificial delay, but we'll leave a small 1s buffer for UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep(2); // Lanjut ke step 3
      setMobilePanel("preview"); // Mobile: auto pindah ke panel preview biar user sadar website sudah ter-generate
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("Proses generate dibatalkan.");
      } else {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setIsLoading(false);
      setIsBuilding(false);
    }
  };

  const checkHasChanges = () => {
    if (!originalContent) return true; // if not loaded, always has changes

    const tentativeUpdatedContent: TemplateData = {
      ...(templateData || ({} as TemplateData)),
      namaBisnis: formData.namaBisnis,
      namaPanggilan: formData.namaPanggilan,
      kategori: formData.kategoriJasa,
      lokasi: formData.lokasi,
      kontak: { wa: formData.nomorWhatsApp, telepon: formData.telepon, email: formData.email },
      sosmed: { instagram: formData.instagram, tiktok: formData.tiktok, twitter: formData.x_twitter },
      warna: { primary: formData.primaryColor, tema: (formData.tema || "light") as "dark" | "light" },
      paketHarga: formData.paketHarga,
      keahlian: (formData.keahlianList || []).filter((k) => k.nama.trim()),
      pengalaman: (formData.pengalaman || []).filter((p) => p.judul.trim()),
      logo: formData.logo,
      portofolio: formData.portofolio,
    };

    const tentativeFinalDbContent = { ...tentativeUpdatedContent, __formData: formData };
    return JSON.stringify(tentativeFinalDbContent) !== JSON.stringify(originalContent);
  };

  const handleSaveUpdate = async () => {
    if (!canProceed() || !idParam) return;
    
    if (!checkHasChanges()) {
      setShowSavePrompt(false);
      return;
    }

    setIsLoading(true); setError(""); setSaveStatus("idle");
    setShowSavePrompt(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda harus login.");

      // Upload via helper dgn token user eksplisit (hindari regresi propagasi token SDK).
      const uploadFile = async (file: File, folder: string) => {
        try {
          return await uploadAsset(supabase, file, folder, user.id);
        } catch (e: any) {
          console.error("Upload error:", e);
          throw new Error(`Gagal upload gambar (${folder}). Detail: ${e.message || 'Kesalahan tidak diketahui'}.`);
        }
      };

      // Optimize images before upload
      setIsOptimizing(true);
      const optimizedLogo = logoFile ? await convertToWebP(logoFile, 0.9).catch(() => logoFile) : null;
      setIsOptimizing(false);

      let logoUrl = "";
      if (optimizedLogo) {
        logoUrl = await uploadFile(optimizedLogo, 'logos');
      } else if (formData.logo && !formData.logo.startsWith('blob:')) {
        logoUrl = formData.logo;
      } else if (templateData?.logo && !templateData.logo.startsWith('blob:')) {
        // Fallback: use the existing logo from templateData (already uploaded URL)
        logoUrl = templateData.logo;
      }

      // Sumber foto portofolio: mode portfolio → foto proyek (step 2, hanya yg berfoto); selain itu → upload portofolio (step 3).
      const portoSource = formMode === "portfolio"
        ? formData.proyekPortofolio
            .map((p, i) => ({ url: p.foto, file: proyekFotoFiles[i] || null }))
            .filter((e) => !!e.url)
        : formData.portofolio.map((url, i) => ({ url, file: portofolioFiles[i] || null }));

      let portofolioUrls: string[] = (await Promise.all(portoSource.map(async ({ url, file }) => {
        if (url && url.startsWith('blob:') && file) {
          const opt = await convertToWebP(file, 0.85).catch(() => file);
          return await uploadFile(opt, 'portofolio');
        } else if (url && !url.startsWith('blob:')) {
          return url;
        }
        return "";
      }))).filter(url => url !== "");
      // Fallback: if all portofolio URLs were stale blobs with no File objects, keep existing ones
      if (portofolioUrls.length === 0 && templateData?.portofolio && templateData.portofolio.length > 0) {
        portofolioUrls = templateData.portofolio.filter(url => !url.startsWith('blob:'));
      }

      // Foto bisnis (slot bernama [0]=Hero, [1]=Profil) — pertahankan index, jangan filter "".
      let fotoBisnisUrls = await Promise.all(
        formData.fotoBisnis.map(async (url, i) => {
          if (url && url.startsWith('blob:') && fotoBisnisFiles[i]) {
            const opt = await convertToWebP(fotoBisnisFiles[i]!, 0.85).catch(() => fotoBisnisFiles[i]!);
            return await uploadFile(opt, 'foto-bisnis');
          } else if (url && !url.startsWith('blob:')) {
            return url;
          }
          return "";
        })
      );
      // Fallback: jika tidak ada foto bisnis baru, pertahankan yang sudah tersimpan
      if (fotoBisnisUrls.every(u => !u) && templateData?.fotoBisnis && templateData.fotoBisnis.length > 0) {
        fotoBisnisUrls = templateData.fotoBisnis.filter(u => !u.startsWith('blob:'));
      }

      // Builder produk: upload foto produk & jadikan layanan+portofolio (tanpa foto random).
      const produkUrls = usesBuilder ? await Promise.all(formData.produkList.map(async (pr, i) => {
        const f = produkFotoFiles[i] || null;
        if (pr.foto && pr.foto.startsWith('blob:') && f) { const opt = await convertToWebP(f, 0.85).catch(() => f); return await uploadFile(opt, 'portofolio'); }
        if (pr.foto && !pr.foto.startsWith('blob:')) return pr.foto;
        return "";
      })) : [];
      const produkTerisi = usesBuilder
        ? formData.produkList.map((pr, i) => ({ pr, url: produkUrls[i] || "" })).filter((e) => e.pr.nama.trim())
        : [];
      const produkLayanan = produkTerisi.map((e) => ({ nama: e.pr.nama, deskripsi: e.pr.deskripsi, harga: e.pr.harga }));
      const produkFoto = produkTerisi.map((e) => e.url);
      const produkListClean = formData.produkList.map((pr, i) => ({ ...pr, foto: produkUrls[i] ?? pr.foto }));
      if (usesBuilder) portofolioUrls = produkFoto;

      // Merge current templateData with new formData
      const updatedContent: TemplateData = {
        ...(templateData || ({} as TemplateData)),
        namaBisnis: formData.namaBisnis,
        namaPanggilan: formData.namaPanggilan,
        kategori: formData.kategoriJasa,
        lokasi: formData.lokasi,
        kontak: { wa: formData.nomorWhatsApp, telepon: formData.telepon, email: formData.email },
        sosmed: { instagram: formData.instagram, tiktok: formData.tiktok, twitter: formData.x_twitter },
        warna: { primary: formData.primaryColor, tema: (formData.tema || "light") as "dark" | "light" },
        paketHarga: formData.paketHarga,
        ...(usesBuilder ? { layanan: produkLayanan } : {}),
        // Simpan tanpa regenerate AI: pertahankan deskripsi keahlian yang sudah diringkas
        // AI di generate sebelumnya (cocok via nama). Keahlian baru/diedit pakai teks
        // wizard; layout tetap aman karena kartu keahlian dibatasi 3 baris (CSS clamp).
        keahlian: formData.keahlianList.filter((k) => k.nama.trim()).map((k) => ({
          nama: k.nama,
          deskripsi: templateData?.keahlian?.find((p) => p.nama === k.nama)?.deskripsi || k.deskripsi,
        })),
        pengalaman: formData.pengalaman.filter((p) => p.judul.trim()),
        logo: logoUrl,
        portofolio: portofolioUrls,
        portofolioJudul: formData.portofolioJudul || [],
        fotoBisnis: fotoBisnisUrls,
      };

      // Save clean URLs in __formData so next load won't have stale blob URLs
      const cleanFormData = {
        ...formData,
        logo: logoUrl,
        portofolio: portofolioUrls,
        portofolioJudul: formData.portofolioJudul || [],
        produkList: produkListClean,
        fotoBisnis: fotoBisnisUrls,
      };
      const finalDbContent = { ...updatedContent, __formData: cleanFormData };

      const { error: dbError } = await supabase
        .from('websites')
        .update({
          nama_usaha: projectName || formData.namaBisnis || "Website Baru",
          deskripsi: formData.tagline,
          kategori: formData.kategoriJasa,
          logo_url: logoUrl,
          foto_urls: portofolioUrls,
          generated_content: finalDbContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', idParam);

      if (dbError) throw dbError;

      setTemplateData(updatedContent);
      setOriginalContent(finalDbContent); // Reset change detection
      setSaveStatus("success");

      // Redirect ke dashboard setelah 2 detik
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFullView = () => {
    if (templateData) {
      safeStorage.set("zp_preview_data", JSON.stringify(templateData));
      safeStorage.set("zp_preview_template", selectedTemplateId);
      window.open("/preview-full", "_blank");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top Bar */}
      <header className="flex-shrink-0 h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-between px-3 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              if (templateData) setShowBackDialog(true);
              else router.push('/dashboard/template');
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors mr-1 sm:mr-2 cursor-pointer"
            title="Kembali ke Pilih Template"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img src="/Logo buatkanweb.webp" alt="BuatkanWeb.id Logo" className="w-7 h-7 rounded-lg object-contain" />
          <span className="font-semibold text-[14px] tracking-tight text-zinc-100">BuatkanWeb.id</span>
        </div>
        {/* Mobile tab toggle */}
        <div className="flex md:hidden items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 gap-0.5">
          <button type="button" onClick={() => setMobilePanel("form")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${mobilePanel === "form" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500"}`}>
            <PenLine className="w-3.5 h-3.5" /> Form
          </button>
          <button type="button" onClick={() => setMobilePanel("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${mobilePanel === "preview" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500"}`}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ LEFT PANEL (Form) ═══ */}
        <aside className={`flex-shrink-0 w-full md:max-w-[420px] border-r border-zinc-800/80 bg-zinc-950 flex flex-col overflow-hidden ${mobilePanel === "form" ? "flex" : "hidden"} md:flex`}>
          {/* Step Indicator */}
          <div className="px-5 pt-5 pb-4 border-b border-zinc-800/50">
            <div className="flex items-center mb-4">
              {(formMode === "portfolio"
                ? [{ label: "Profil Pribadi", num: "01" }, { label: "Proyek & Keahlian", num: "02" }, { label: "Visual & Aset", num: "03" }]
                : STEP_INFO
              ).map((s, i) => {
                const isActive = i === step, isDone = i < step;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? "bg-indigo-600" : isDone ? "bg-indigo-600/20 border border-indigo-500/30" : "bg-zinc-800/60 border border-zinc-800"}`}>
                      <span className={`text-[11px] font-extrabold tracking-tight ${isActive ? "text-white" : isDone ? "text-indigo-400" : "text-zinc-600"}`}>{s.num}</span>
                    </div>
                    {i < STEP_INFO.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${isDone ? "bg-indigo-500/60" : "bg-zinc-800"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-indigo-400 tabular-nums">{(formMode === "portfolio" ? [{ num: "01", label: "Profil Pribadi" }, { num: "02", label: "Proyek & Keahlian" }, { num: "03", label: "Visual & Aset" }] : STEP_INFO)[step].num}</span>
              <h2 className="font-semibold text-[14px] text-zinc-100">
                <span className="text-zinc-400 font-normal">{(formMode === "portfolio" ? [{ num: "01", label: "Profil Pribadi" }, { num: "02", label: "Proyek & Keahlian" }, { num: "03", label: "Visual & Aset" }] : STEP_INFO)[step].label}</span>
              </h2>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">


            {/* ═══ STEP 1 ═══ */}
            {step === 0 && formMode === "jasa" && (
              <>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Building2 className="w-3 h-3" /> {cpy.namaLabel}</label>
                  <input id="input-nama-bisnis" type="text" value={formData.namaBisnis} onChange={(e) => updateField("namaBisnis", e.target.value)} placeholder={cpy.namaPlaceholder} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Type className="w-3 h-3" /> Tagline</label>
                  <input id="input-tagline" type="text" value={formData.tagline} onChange={(e) => updateField("tagline", e.target.value)} placeholder={cpy.taglinePlaceholder} className={inputClass} />
                  <p className="text-zinc-600 text-[11px]">Slogan singkat yang menggambarkan bisnis Anda</p>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Award className="w-3 h-3" /> {cpy.kategoriLabel}</label>
                  <AutocompleteInput id="input-kategori" value={formData.kategoriJasa} onChange={(v) => updateField("kategoriJasa", v)} suggestions={kategoriSuggestions} placeholder={cpy.kategoriPlaceholder} />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><MapPin className="w-3 h-3" /> Lokasi / Area</label>
                  <SearchableCombobox value={formData.lokasi} onChange={(v) => updateField("lokasi", v)} />
                </div>

                {/* Kontak */}
                <div className="space-y-2.5 pt-1">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider"><Phone className="w-3 h-3" /> Informasi Kontak</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">WhatsApp</label>
                      <div
                        className="relative"
                        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setShowWaDropdown(false); }}
                      >
                        <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition-all duration-200">
                          <button
                            type="button"
                            onClick={() => setShowWaDropdown((v) => !v)}
                            className="flex items-center gap-1 px-2.5 py-2 text-zinc-300 text-[12px] font-medium flex-shrink-0 border-r border-zinc-800 hover:bg-zinc-800/60 transition-colors focus:outline-none"
                          >
                            <span>{waCountryCode}</span>
                            <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${showWaDropdown ? "rotate-180" : ""}`} />
                          </button>
                          <input
                            id="input-whatsapp"
                            type="text"
                            value={(() => {
                              const digits = waCountryCode.replace("+", "");
                              return formData.nomorWhatsApp.startsWith(digits) ? formData.nomorWhatsApp.slice(digits.length) : formData.nomorWhatsApp;
                            })()}
                            onChange={(e) => {
                              const local = e.target.value.replace(/\D/g, "");
                              updateField("nomorWhatsApp", waCountryCode.replace("+", "") + local);
                            }}
                            placeholder=""
                            className="flex-1 bg-transparent px-3 py-2 text-[12px] text-zinc-100 focus:outline-none"
                          />
                        </div>
                        {showWaDropdown && (
                          <div className="absolute left-0 top-full mt-1 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div className="max-h-52 overflow-y-auto">
                              {COUNTRY_CODES.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    const oldDigits = waCountryCode.replace("+", "");
                                    const newDigits = c.code.replace("+", "");
                                    const localNum = formData.nomorWhatsApp.startsWith(oldDigits) ? formData.nomorWhatsApp.slice(oldDigits.length) : formData.nomorWhatsApp;
                                    setWaCountryCode(c.code);
                                    updateField("nomorWhatsApp", newDigits + localNum);
                                    setShowWaDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] hover:bg-zinc-800 transition-colors text-left ${c.code === waCountryCode ? "bg-zinc-800/60 text-indigo-400" : "text-zinc-300"}`}
                                >
                                  <span className="text-[16px] leading-none flex-shrink-0">{c.flag}</span>
                                  <span className="flex-1 truncate">{c.country}</span>
                                  <span className="text-zinc-500 font-mono flex-shrink-0">{c.code}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Email</label>
                      <input id="input-email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="info@bisnis.com" className={`${inputClass} !py-2 !text-[12px]`} />
                    </div>
                  </div>
                </div>

                {/* Sosial Media */}
                <div className="space-y-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider"><AtSign className="w-3 h-3" /> Sosial Media <span className="text-zinc-700 font-normal">(opsional)</span></p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Instagram</label>
                      <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition-all duration-200">
                        <span className="px-2.5 py-2 text-zinc-500 text-[12px] font-medium flex-shrink-0 border-r border-zinc-800 select-none">@</span>
                        <input id="input-ig" type="text" value={formData.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="username" className="flex-1 bg-transparent px-3 py-2 text-[16px] sm:text-[12px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">TikTok</label>
                      <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition-all duration-200">
                        <span className="px-2.5 py-2 text-zinc-500 text-[12px] font-medium flex-shrink-0 border-r border-zinc-800 select-none">@</span>
                        <input id="input-tiktok" type="text" value={formData.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} placeholder="username" className="flex-1 bg-transparent px-3 py-2 text-[16px] sm:text-[12px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">X (Twitter)</label>
                    <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition-all duration-200">
                      <span className="px-2.5 py-2 text-zinc-500 text-[12px] font-medium flex-shrink-0 border-r border-zinc-800 select-none">@</span>
                      <input id="input-twitter" type="text" value={formData.x_twitter} onChange={(e) => updateField("x_twitter", e.target.value)} placeholder="username" className="flex-1 bg-transparent px-3 py-2 text-[16px] sm:text-[12px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══ STEP 1 — PORTFOLIO ═══ */}
            {step === 0 && formMode === "portfolio" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Hash className="w-3 h-3" /> Nama Lengkap</label>
                    <input type="text" value={formData.namaBisnis} onChange={(e) => updateField("namaBisnis", e.target.value)} placeholder="contoh: Andi Pratama" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Type className="w-3 h-3" /> Nama Panggilan</label>
                    <input type="text" value={formData.namaPanggilan} onChange={(e) => updateField("namaPanggilan", e.target.value)} placeholder="contoh: Andi" className={inputClass} />
                  </div>
                </div>
                <p className="text-zinc-600 text-[11px] -mt-2">Nama panggilan jadi teks besar (layering) di hero.</p>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Type className="w-3 h-3" /> Profesi / Role</label>
                  <AutocompleteInput id="input-profesi" value={formData.tagline} onChange={(v) => updateField("tagline", v)} suggestions={PROFESI_OPTIONS} placeholder="contoh: UI/UX Designer" />
                  <p className="text-zinc-600 text-[11px]">Pilih dari saran atau ketik sendiri. Tampil sebagai badge di hero.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><AlignLeft className="w-3 h-3" /> Bio / Tentang Saya</label>
                  <textarea value={formData.keunggulan} onChange={(e) => updateField("keunggulan", e.target.value)} placeholder="Ceritakan dirimu singkat: fokus kerja, nilai, dan pendekatan..." rows={3} className={`${inputClass} resize-none`} />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><MapPin className="w-3 h-3" /> Lokasi</label>
                  <SearchableCombobox value={formData.lokasi} onChange={(v) => updateField("lokasi", v)} />
                </div>
                <div className="space-y-2.5 pt-1">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider"><Phone className="w-3 h-3" /> Kontak</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">WhatsApp</label>
                      <div
                        className="relative"
                        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setShowWaDropdown(false); }}
                      >
                        <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition-all duration-200">
                          <button type="button" onClick={() => setShowWaDropdown((v) => !v)} className="flex items-center gap-1 px-2.5 py-2 text-zinc-300 text-[12px] font-medium flex-shrink-0 border-r border-zinc-800 hover:bg-zinc-800/60 transition-colors focus:outline-none">
                            <span>{waCountryCode}</span>
                            <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${showWaDropdown ? "rotate-180" : ""}`} />
                          </button>
                          <input type="text" value={(() => { const digits = waCountryCode.replace("+", ""); return formData.nomorWhatsApp.startsWith(digits) ? formData.nomorWhatsApp.slice(digits.length) : formData.nomorWhatsApp; })()} onChange={(e) => { const local = e.target.value.replace(/\D/g, ""); updateField("nomorWhatsApp", waCountryCode.replace("+", "") + local); }} placeholder="" className="flex-1 bg-transparent px-3 py-2 text-[12px] text-zinc-100 focus:outline-none" />
                        </div>
                        {showWaDropdown && (
                          <div className="absolute left-0 top-full mt-1 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div className="max-h-52 overflow-y-auto">
                              {COUNTRY_CODES.map((c) => (
                                <button key={c.code} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { const oldDigits = waCountryCode.replace("+", ""); const newDigits = c.code.replace("+", ""); const localNum = formData.nomorWhatsApp.startsWith(oldDigits) ? formData.nomorWhatsApp.slice(oldDigits.length) : formData.nomorWhatsApp; setWaCountryCode(c.code); updateField("nomorWhatsApp", newDigits + localNum); setShowWaDropdown(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] hover:bg-zinc-800 transition-colors text-left ${c.code === waCountryCode ? "bg-zinc-800/60 text-indigo-400" : "text-zinc-300"}`}>
                                  <span className="text-[16px] leading-none flex-shrink-0">{c.flag}</span>
                                  <span className="flex-1 truncate">{c.country}</span>
                                  <span className="text-zinc-500 font-mono flex-shrink-0">{c.code}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Email</label>
                      <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="kamu@email.com" className={`${inputClass} !py-2 !text-[12px]`} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider"><AtSign className="w-3 h-3" /> Sosial Media <span className="text-zinc-700 font-normal">(opsional)</span></p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Instagram</label>
                      <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition-all duration-200">
                        <span className="px-2.5 py-2 text-zinc-500 text-[12px] font-medium flex-shrink-0 border-r border-zinc-800 select-none">@</span>
                        <input type="text" value={formData.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="username" className="flex-1 bg-transparent px-3 py-2 text-[16px] sm:text-[12px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">LinkedIn</label>
                      <input type="url" value={formData.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" className={`${inputClass} !py-2 !text-[12px]`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">X (Twitter)</label>
                    <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-600 focus-within:border-zinc-600 transition-all duration-200">
                      <span className="px-2.5 py-2 text-zinc-500 text-[12px] font-medium flex-shrink-0 border-r border-zinc-800 select-none">@</span>
                      <input type="text" value={formData.x_twitter} onChange={(e) => updateField("x_twitter", e.target.value)} placeholder="username" className="flex-1 bg-transparent px-3 py-2 text-[16px] sm:text-[12px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ═══ STEP 2 ═══ */}
            {step === 1 && formMode === "jasa" && (
              <>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><AlignLeft className="w-3 h-3" /> Keunggulan Bisnis</label>
                  <textarea id="input-keunggulan" value={formData.keunggulan} onChange={(e) => updateField("keunggulan", e.target.value)} placeholder={cpy.keunggulanPlaceholder} rows={3} className={`${inputClass} resize-none`} />
                  <p className="text-zinc-600 text-[11px]">Tulis keunggulan unik yang membedakan bisnis Anda</p>
                </div>
                {usesBuilder ? (
                  /* Builder produk manual — foto + nama + deskripsi + harga per produk.
                     Section Produk template render persis dari sini (tanpa foto random). */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Award className="w-3 h-3" /> Produk</label>
                      <button type="button" onClick={addProduk} className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                        <Plus className="w-3 h-3" /> Tambah Produk
                      </button>
                    </div>
                    <p className="text-zinc-600 text-[11px] -mt-1">Tiap produk punya foto, nama, deskripsi, dan harga sendiri. Kalau kosong, section Produk tidak ditampilkan.</p>

                    {formData.produkList.length === 0 && (
                      <button type="button" onClick={addProduk} className="w-full border-2 border-dashed border-zinc-800 rounded-xl py-6 flex flex-col items-center gap-1.5 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer">
                        <Plus className="w-5 h-5" />
                        <span className="text-[12px] font-medium">Tambah Produk Pertama</span>
                      </button>
                    )}

                    {formData.produkList.map((pr, idx) => (
                      <div key={idx} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Produk {idx + 1}</span>
                          <button type="button" onClick={() => removeProduk(idx)} aria-label="Hapus produk" className="p-1 rounded-md hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-3">
                          {/* Foto produk */}
                          {pr.foto ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0 group/pf">
                              <img src={pr.foto} alt={pr.nama || `Produk ${idx + 1}`} className="w-full h-full object-cover" />
                              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/pf:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <span className="text-[10px] text-white font-medium">Ganti</span>
                                <input type="file" accept={IMG_ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProdukFoto(idx, f); e.target.value = ""; }} />
                              </label>
                            </div>
                          ) : (
                            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/40 transition-colors text-center">
                              <Camera className="w-4 h-4 text-zinc-500" />
                              <span className="text-[9px] text-zinc-500">Foto</span>
                              <input type="file" accept={IMG_ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProdukFoto(idx, f); e.target.value = ""; }} />
                            </label>
                          )}
                          <div className="flex-1 min-w-0 space-y-2">
                            <AutocompleteInput id={`produk-nama-${idx}`} value={pr.nama} onChange={(v) => updateProduk(idx, "nama", v)} suggestions={PRODUK_SUGGESTIONS} placeholder="Nama produk, mis. Telur Ayam" />
                            <input type="text" maxLength={40} value={pr.harga} onChange={(e) => updateProduk(idx, "harga", e.target.value)} placeholder="Harga, mis. Rp 28.000 / kg (opsional)" className={`${inputClass} !py-2 !text-[12px]`} />
                          </div>
                        </div>
                        <textarea value={pr.deskripsi} onChange={(e) => updateProduk(idx, "deskripsi", e.target.value)} placeholder="Deskripsi singkat produk..." rows={2} className={`${inputClass} !py-2 !text-[12px] resize-none`} />
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Award className="w-3 h-3" /> {cpy.layananLabel}</label>
                  <MultiSelectDropdown id="input-layanan" value={formData.layananSpesifik} onChange={(val) => updateField("layananSpesifik", val)} options={layananOptions} placeholder="Pilih layanan..." />
                </div>
                )}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Target className="w-3 h-3" /> Target Pelanggan</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Usia</label>
                      <MultiSelectDropdown id="input-usia" value={formData.usia} onChange={(val) => updateField("usia", val)} options={USIA_OPTIONS} placeholder="Pilih usia..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Status Keluarga</label>
                      <MultiSelectDropdown id="input-status" value={formData.statusKeluarga} onChange={(val) => updateField("statusKeluarga", val)} options={STATUS_OPTIONS} placeholder="Pilih status..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Pekerjaan</label>
                      <MultiSelectDropdown id="input-pekerjaan" value={formData.pekerjaan} onChange={(val) => updateField("pekerjaan", val)} options={PEKERJAAN_OPTIONS} placeholder="Pilih pekerjaan..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Gaya Hidup</label>
                      <MultiSelectDropdown id="input-gayahidup" value={formData.gayaHidup} onChange={(val) => updateField("gayaHidup", val)} options={GAYA_HIDUP_OPTIONS} placeholder="Pilih gaya hidup..." />
                    </div>
                  </div>
                </div>

                {/* ── Paket Harga Builder ── */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><DollarSign className="w-3 h-3" /> Atur Paket & Harga</label>
                    <button type="button" onClick={addPaket} className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                      <Plus className="w-3 h-3" /> Tambah Paket
                    </button>
                  </div>
                  <p className="text-zinc-600 text-[11px] -mt-1">Opsional. Jika kosong, template akan menggunakan paket bawaan.</p>

                  {formData.paketHarga.map((paket, idx) => (
                    <div key={idx} className={`border rounded-xl p-4 space-y-3 transition-all ${paket.isPopuler ? "bg-indigo-950/40 border-indigo-500/30" : "bg-zinc-900/80 border-zinc-800"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Paket {idx + 1}</span>
                        <div className="flex items-center gap-0.5">
                          <button type="button" onClick={() => movePaketUp(idx)} disabled={idx === 0} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => movePaketDown(idx)} disabled={idx === formData.paketHarga.length - 1} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => removePaket(idx)} className="p-1 rounded-md hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer ml-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input type="text" maxLength={40} value={paket.namaPaket} onChange={(e) => updatePaket(idx, "namaPaket", e.target.value)}
                        placeholder="contoh: Paket Hemat" className={`${inputClass} !py-2 !text-[12px]`} />
                      <input type="text" maxLength={30} value={paket.harga} onChange={(e) => updatePaket(idx, "harga", e.target.value)}
                        placeholder="contoh: 150rb" className={`${inputClass} !py-2 !text-[12px]`} />
                      <div>
                        <p className="text-zinc-500 text-[10px] mb-1.5 uppercase tracking-wider font-medium">Fitur Paket</p>
                        <div className="flex flex-wrap gap-1.5 items-center min-h-[36px] bg-zinc-900/60 border border-zinc-800 rounded-lg px-2.5 py-1.5">
                          {paket.fitur.map((f, fi) => (
                            <span key={fi} className="inline-flex items-center gap-1 bg-indigo-600/20 text-indigo-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-indigo-500/20">
                              {f}
                              <button type="button" onClick={() => updatePaket(idx, "fitur", paket.fitur.filter((_, i) => i !== fi))} className="hover:text-indigo-100 cursor-pointer">
                                <X className="w-2 h-2" />
                              </button>
                            </span>
                          ))}
                          <input type="text" maxLength={50} placeholder="Ketik fitur + Enter"
                            className="flex-1 min-w-[100px] bg-transparent text-[11px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none py-0.5"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !paket.fitur.includes(val)) {
                                  updatePaket(idx, "fitur", [...paket.fitur, val]);
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      {/* Populer Toggle */}
                      <button type="button" onClick={() => togglePopuler(idx)}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${paket.isPopuler
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                          : "bg-zinc-800/40 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                          }`}>
                        <Star className={`w-3 h-3 ${paket.isPopuler ? "fill-amber-400" : ""}`} />
                        {paket.isPopuler ? "Paket Populer ✓" : "Jadikan Paket Populer"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ STEP 2 — PORTFOLIO ═══ */}
            {step === 1 && formMode === "portfolio" && (
              <>
                {/* Keahlian — nama + deskripsi singkat per item */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Star className="w-3 h-3" /> Keahlian</label>
                    <button type="button" onClick={addKeahlian} className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                      <Plus className="w-3 h-3" /> Tambah Keahlian
                    </button>
                  </div>
                  <p className="text-zinc-600 text-[11px] -mt-1">Nama keahlian + ceritakan bebas (sepanjang apapun) apa yang sudah kamu kerjakan dengan keahlian itu. AI akan meringkasnya jadi padat dan rapi otomatis.</p>
                  {formData.keahlianList.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-[12px]">
                      Belum ada keahlian. Klik Tambah Keahlian.
                    </div>
                  )}
                  {formData.keahlianList.map((k, idx) => (
                    <div key={idx} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="text" maxLength={40} value={k.nama} onChange={(e) => updateKeahlian(idx, "nama", e.target.value)} placeholder="contoh: UI/UX Design" className={`${inputClass} !py-2 !text-[12px] flex-1`} />
                        <button type="button" onClick={() => removeKeahlian(idx)} className="p-1.5 rounded-md hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Tanpa batas panjang: user bebas menulis sepanjang apapun, AI yang meringkas jadi padat. */}
                      <textarea rows={2} value={k.deskripsi} onChange={(e) => updateKeahlian(idx, "deskripsi", e.target.value)} placeholder="ceritakan bebas, AI akan meringkas jadi padat" className={`${inputClass} !py-2 !text-[12px] resize-y min-h-[40px]`} />
                    </div>
                  ))}
                </div>

                {/* Pengalaman — hanya template yang punya section ini (personal-002/003) */}
                {(selectedTemplateId === "personal-002" || selectedTemplateId === "personal-003") && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Award className="w-3 h-3" /> Pengalaman</label>
                      <button type="button" onClick={addPengalaman} className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                        <Plus className="w-3 h-3" /> Tambah Pengalaman
                      </button>
                    </div>
                    <p className="text-zinc-600 text-[11px] -mt-1">Riwayat Pekerjaan, Kompetisi, atau Organisasi. Tampil sebagai tab di template.</p>
                    {formData.pengalaman.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-[12px]">
                        Belum ada pengalaman. Klik Tambah Pengalaman.
                      </div>
                    )}
                    {formData.pengalaman.map((p, idx) => (
                      <div key={idx} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <select value={p.kategori} onChange={(e) => updatePengalaman(idx, "kategori", e.target.value)} className={`${inputClass} !py-2 !text-[12px] flex-1`}>
                            <option value="pekerjaan">Pekerjaan / Project</option>
                            <option value="kompetisi">Kompetisi</option>
                            <option value="organisasi">Organisasi</option>
                          </select>
                          <select value={p.tahun} onChange={(e) => updatePengalaman(idx, "tahun", e.target.value)} className={`${inputClass} !py-2 !text-[12px] !w-28 flex-shrink-0`}>
                            <option value="">Tahun</option>
                            {TAHUN_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <button type="button" onClick={() => removePengalaman(idx)} className="p-1.5 rounded-md hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input type="text" maxLength={80} value={p.judul} onChange={(e) => updatePengalaman(idx, "judul", e.target.value)} placeholder="Judul — contoh: Juara 1 Inkubator UNY" className={`${inputClass} !py-2 !text-[12px]`} />
                        <textarea value={p.deskripsi} onChange={(e) => updatePengalaman(idx, "deskripsi", e.target.value)} placeholder="Deskripsi singkat (1-2 kalimat)" rows={2} className={`${inputClass} !py-2 !text-[12px] resize-none`} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Proyek */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><ImagePlus className="w-3 h-3" /> Proyek</label>
                    <button type="button" onClick={addProyek} className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                      <Plus className="w-3 h-3" /> Tambah Proyek
                    </button>
                  </div>
                  {formData.proyekPortofolio.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-[12px]">
                      Belum ada proyek. Klik Tambah Proyek.
                    </div>
                  )}
                  {formData.proyekPortofolio.map((proyek, idx) => (
                    <div key={idx} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Proyek {idx + 1}</span>
                        <button type="button" onClick={() => removeProyek(idx)} className="p-1 rounded-md hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Foto proyek */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Foto / Thumbnail</label>
                        {proyek.foto ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-700 group">
                            <img src={proyek.foto} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeProyekFoto(idx)}
                              className="absolute top-2 right-2 bg-black/60 hover:bg-red-900/80 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full aspect-video border border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/40 transition-colors group">
                            <Camera className="w-6 h-6 text-zinc-600 group-hover:text-indigo-400 transition-colors mb-1.5" />
                            <span className="text-[11px] text-zinc-600 group-hover:text-zinc-400">Upload foto proyek</span>
                            <input type="file" accept={IMG_ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProyekFoto(idx, f); }} />
                          </label>
                        )}
                      </div>

                      {/* Nama & Kategori */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Nama Proyek</label>
                          <input type="text" value={proyek.namaProyek} onChange={(e) => updateProyek(idx, "namaProyek", e.target.value)} placeholder="contoh: Redesign App" className={`${inputClass} !py-2 !text-[12px]`} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Kategori / Tag</label>
                          <input type="text" value={proyek.kategori} onChange={(e) => updateProyek(idx, "kategori", e.target.value)} placeholder="contoh: UI/UX" className={`${inputClass} !py-2 !text-[12px]`} />
                        </div>
                      </div>

                      {/* Masalah & Peran */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Masalah / Tantangan</label>
                          <textarea value={proyek.masalah} onChange={(e) => updateProyek(idx, "masalah", e.target.value)} placeholder="Apa masalah yang diselesaikan?" rows={2} className={`${inputClass} !py-2 !text-[12px] resize-none`} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Peranmu</label>
                          <textarea value={proyek.peran} onChange={(e) => updateProyek(idx, "peran", e.target.value)} placeholder="Apa peran / tanggung jawabmu?" rows={2} className={`${inputClass} !py-2 !text-[12px] resize-none`} />
                        </div>
                      </div>

                      {/* Solusi & Hasil */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Solusi</label>
                          <textarea value={proyek.solusi} onChange={(e) => updateProyek(idx, "solusi", e.target.value)} placeholder="Solusi / pendekatan yang diambil" rows={2} className={`${inputClass} !py-2 !text-[12px] resize-none`} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Hasil</label>
                          <textarea value={proyek.hasil} onChange={(e) => updateProyek(idx, "hasil", e.target.value)} placeholder="Hasil / dampak yang dicapai" rows={2} className={`${inputClass} !py-2 !text-[12px] resize-none`} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Anchor scroll: addProyek auto-scroll ke sini supaya slot baru terlihat. */}
                  <div ref={proyekEndRef} />
                </div>
              </>
            )}

            {/* ═══ STEP 3 ═══ */}
            {step === 2 && (
              <>
                {/* Theme — Nuansa (Dark/Light) hanya untuk template jasa berpalet bebas.
                    Template personal (mode portfolio) dan template berpalet terkunci
                    (mis. jasa-002 "Neon" yang selalu gelap) menyembunyikan pilihan ini. */}
                {formMode !== "portfolio" && !temaTerkunci && (
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Palette className="w-3 h-3" /> Nuansa Desain</label>
                  <div className="grid grid-cols-2 gap-3">
                    {NUANSA_OPTIONS.map((opt) => {
                      const Icon = opt.icon; const isSelected = formData.tema === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => updateField("tema", opt.value)}
                          className={`group flex flex-col items-center gap-2.5 p-5 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected ? "bg-indigo-600/10 border-indigo-500/40" : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"}`}>
                          <div className={`w-12 h-12 rounded-xl border ${opt.preview} transition-all`} />
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-0.5">
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-400" : "text-zinc-500"}`} />
                              <p className={`text-[13px] font-semibold ${isSelected ? "text-indigo-300" : "text-zinc-200"}`}>{opt.label}</p>
                            </div>
                            <p className="text-[11px] text-zinc-500">{opt.desc}</p>
                          </div>
                          {isSelected && <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                )}

                {/* Color Picker */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Pipette className="w-3 h-3" /> Preferensi Warna</label>
                  <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl border-2 border-zinc-700 overflow-hidden cursor-pointer shadow-lg" style={{ backgroundColor: formData.primaryColor }}>
                        <input type="color" value={formData.primaryColor} onChange={(e) => updateField("primaryColor", e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[13px] text-zinc-200 font-medium">Warna Utama</p>
                      <p className="text-[12px] text-zinc-500 font-mono">{formData.primaryColor.toUpperCase()}</p>
                    </div>
                    <div className="ml-auto flex gap-1.5">
                      {["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((c) => (
                        <button key={c} type="button" onClick={() => updateField("primaryColor", c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${formData.primaryColor === c ? "border-white scale-110" : "border-zinc-700 hover:border-zinc-500"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logo Upload — disembunyikan di mode portfolio (bukan bisnis) */}
                {formMode !== "portfolio" && (
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><ImagePlus className="w-3 h-3" /> Logo Bisnis</label>
                  <p className="text-zinc-600 text-[10px] -mt-1">PNG, JPG, atau SVG.</p>
                  <input ref={logoInputRef} type="file" accept={IMG_ACCEPT} className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleLogoSelect(e.target.files[0]); e.target.value = ""; }} />
                  {formData.logo ? (
                    <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3">
                      <img src={formData.logo} alt="Logo preview" className="w-14 h-14 rounded-lg object-cover border border-zinc-700" />
                      <div className="flex-1">
                        <p className="text-[13px] text-zinc-300 font-medium">Logo telah diupload</p>
                        <p className="text-[11px] text-zinc-600">Klik × untuk mengganti</p>
                      </div>
                      <button type="button" onClick={handleLogoRemove} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => logoInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "logo")}
                      className="border-2 border-dashed border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group cursor-pointer">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-2 group-hover:bg-zinc-700/80 transition-colors">
                          <ImagePlus className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                        </div>
                        <p className="text-[12px] text-zinc-300 font-medium mb-0.5">Logo Bisnis</p>
                        <p className="text-[10px] text-zinc-600">Seret atau <span className="text-indigo-400">klik untuk upload</span></p>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Slot foto bernama — dipakai mode portfolio ATAU template yang
                    mendaftarkan kebutuhan fotonya di TEMPLATE_PHOTO_SLOTS (lib/templates.ts). */}
                {formMode === "portfolio" || (photoSpec && photoSpec.slots.length > 0) ? (
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Camera className="w-3 h-3" /> {formMode === "portfolio" ? "Foto Pribadi" : "Foto Website"}</label>
                  <p className="text-zinc-600 text-[10px] -mt-1">{formMode === "portfolio" ? "Foto Hero sebaiknya tanpa latar belakang (PNG transparan). Foto lain bebas (akan dipotong otomatis)." : "Foto ini mengisi posisi tetap di template pilihan Anda. Bisa digeser & di-zoom nanti saat edit."}</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Slot foto per template:
                        - personal-002 (brutalist-bento): Hero + 3 foto galeri "About Me" (fotoBisnis[1..3]).
                        - personal-003 (neon-grid): Hero + 4 foto strip section Pengalaman (fotoBisnis[1..4]).
                        - personal lain: Hero + 1 About Me. */}
                    {(photoSpec
                      ? photoSpec.slots
                      : selectedTemplateId === "personal-002"
                      ? [
                          { idx: 0, title: "Foto Hero", hint: "tampil di hero", tip: "Foto utama paling atas website, gambar besar pertama yang dilihat pengunjung." },
                          { idx: 1, title: `Foto "About Me" 1`, hint: "section about me", tip: "Foto pertama di galeri section 'About Me'." },
                          { idx: 2, title: `Foto "About Me" 2`, hint: "section about me", tip: "Foto kedua di galeri section 'About Me'." },
                          { idx: 3, title: `Foto "About Me" 3`, hint: "section about me", tip: "Foto ketiga di galeri section 'About Me'." },
                        ]
                      : selectedTemplateId === "personal-003"
                      ? [
                          { idx: 0, title: "Foto Hero", hint: "tampil di hero", tip: "Foto utama paling atas website, gambar besar pertama yang dilihat pengunjung." },
                          { idx: 1, title: "Foto Galeri 1", hint: "strip pengalaman", tip: "Foto pertama di strip galeri bawah section 'Pengalaman'." },
                          { idx: 2, title: "Foto Galeri 2", hint: "strip pengalaman", tip: "Foto kedua di strip galeri bawah section 'Pengalaman'." },
                          { idx: 3, title: "Foto Galeri 3", hint: "strip pengalaman", tip: "Foto ketiga di strip galeri bawah section 'Pengalaman'." },
                          { idx: 4, title: "Foto Galeri 4", hint: "opsional", tip: "Foto keempat (opsional). Kalau dikosongkan, strip galeri tampil 3 foto saja." },
                        ]
                      : [
                          { idx: 0, title: "Foto Hero", hint: "tampil di hero", tip: "Foto utama paling atas website, gambar besar pertama yang dilihat pengunjung." },
                          { idx: 1, title: "Foto About Me", hint: "section tentang", tip: "Foto di bagian 'Tentang Saya', biasanya foto diri yang lebih personal atau formal." },
                        ]
                    ).map((sl) => {
                      const { idx, title, hint, tip } = sl;
                      const wajib = "wajib" in sl && sl.wajib;
                      const url = formData.fotoBisnis[idx];
                      return (
                        <div key={idx} className="space-y-1.5">
                          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
                            {title}{wajib && <span className="text-red-400 normal-case">*</span>}
                            <span title={tip} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-zinc-600 text-zinc-500 text-[8px] cursor-help normal-case">?</span>
                          </p>
                          {url ? (
                            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-700 group">
                              <img src={url} alt={title} className="w-full h-full object-contain bg-zinc-900" />
                              <button type="button" onClick={() => removeFotoBisnisSlot(idx)} className="absolute top-2 right-2 bg-black/60 hover:bg-red-900/80 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-zinc-800 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/40 transition-colors group text-center p-2">
                              <Camera className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors mb-1.5" />
                              <span className="text-[11px] text-zinc-300 font-medium leading-tight">{title}</span>
                              <span className="text-[9px] text-zinc-600 mt-0.5">{hint}</span>
                              <input type="file" accept={IMG_ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFotoBisnisSlot(idx, f); e.target.value = ""; }} />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                ) : selectedTemplateId !== 'jasa-002' ? (
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Camera className="w-3 h-3" /> Foto Bisnis</label>
                  <p className="text-zinc-600 text-[10px] -mt-1">PNG, JPG, atau SVG. Suasana kerja, toko, atau tim Anda</p>
                  <input ref={fotoBisnisInputRef} type="file" accept={IMG_ACCEPT} multiple className="hidden"
                    onChange={(e) => { if (e.target.files) handlePhotosSelect(e.target.files, "fotoBisnis"); e.target.value = ""; }} />
                  <div onClick={() => fotoBisnisInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "fotoBisnis")}
                    className="border-2 border-dashed border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-2 group-hover:bg-zinc-700/80 transition-colors">
                        <Camera className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <p className="text-[12px] text-zinc-300 font-medium mb-0.5">Foto Bisnis</p>
                      <p className="text-[10px] text-zinc-600">Seret atau <span className="text-indigo-400">klik untuk upload</span></p>
                    </div>
                  </div>
                  {formData.fotoBisnis.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.fotoBisnis.map((url, i) => (
                        <div key={i} className="relative group/thumb">
                          <img src={url} alt={`Foto Bisnis ${i + 1}`} className="w-full aspect-square rounded-lg object-cover border border-zinc-800" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); handlePhotoRemove(i, "fotoBisnis"); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer shadow-lg">
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                ) : null}

                {/* Portofolio: mode portfolio ambil dari foto proyek (step 2); template builder
                    ambil dari foto tiap Produk (step 2) — uploader ini disembunyikan. */}
                {usesBuilder ? (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Upload className="w-3 h-3" /> Foto Produk</label>
                  <p className="text-zinc-600 text-[11px] bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2">Foto produk diambil otomatis dari daftar <span className="text-indigo-400">Produk</span> di step 2. Tambah/ubah produk di sana.</p>
                </div>
                ) : formMode === "portfolio" ? (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Upload className="w-3 h-3" /> Foto Portofolio</label>
                  <p className="text-zinc-600 text-[11px] bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2">Foto portofolio diambil otomatis dari <span className="text-indigo-400">Foto Proyek</span> di step 2. Tambah/ubah proyek di sana.</p>
                </div>
                ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider">
                      <Upload className="w-3 h-3" /> {photoSpec?.portofolio?.label ?? "Foto Portofolio"}
                      {!!photoSpec?.portofolio?.min && <span className="text-red-400">*</span>}
                    </label>
                    <span className="text-[10px] font-medium text-zinc-500 tabular-nums">{formData.portofolio.length}/{maxPortofolio}</span>
                  </div>
                  <p className="text-zinc-600 text-[10px] -mt-1">{photoSpec?.portofolio?.hint ?? "PNG, JPG, atau SVG. Hasil karya atau proyek yang sudah selesai."}</p>
                  <input ref={portofolioInputRef} type="file" accept={IMG_ACCEPT} multiple className="hidden"
                    onChange={(e) => { if (e.target.files) handlePhotosSelect(e.target.files, "portofolio"); e.target.value = ""; }} />
                  {formData.portofolio.length < maxPortofolio && (
                  <div onClick={() => portofolioInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "portofolio")}
                    className="border-2 border-dashed border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-2 group-hover:bg-zinc-700/80 transition-colors">
                        <Upload className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <p className="text-[12px] text-zinc-300 font-medium mb-0.5">{photoSpec?.portofolio?.label ?? "Foto Portofolio"}</p>
                      <p className="text-[10px] text-zinc-600">Seret atau <span className="text-indigo-400">klik untuk upload</span></p>
                    </div>
                  </div>
                  )}
                  {formData.portofolio.length > 0 && (
                    photoSpec?.portofolio?.judul ? (
                      /* Template minta judul per foto (mis. jasa-001) — judulnya jadi label kartu galeri. */
                      <div className="space-y-2">
                        {formData.portofolio.map((url, i) => (
                          <div key={i} className="flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl p-2">
                            <img src={url} alt={`Foto ${i + 1}`} className="w-14 h-14 rounded-lg object-cover border border-zinc-800 flex-shrink-0" />
                            <input
                              type="text"
                              value={formData.portofolioJudul?.[i] ?? ""}
                              onChange={(e) => setPortofolioJudul(i, e.target.value)}
                              placeholder={photoSpec.portofolio?.judulPlaceholder || "Judul foto"}
                              maxLength={60}
                              className="flex-1 min-w-0 bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60"
                            />
                            <button type="button" onClick={() => handlePhotoRemove(i, "portofolio")} aria-label="Hapus foto"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors cursor-pointer flex-shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.portofolio.map((url, i) => (
                        <div key={i} className="relative group/thumb">
                          <img src={url} alt={`Portfolio ${i + 1}`} className="w-full aspect-square rounded-lg object-cover border border-zinc-800" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); handlePhotoRemove(i, "portofolio"); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer shadow-lg">
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    )
                  )}
                </div>
                )}
              </>
            )}

            {error && <div className="bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3 text-red-400 text-[12px]">{error}</div>}
          </div>

          {/* Navigation */}
          <div className="px-5 py-4 border-t border-zinc-800/50 flex flex-col gap-3">
            <div className="flex gap-2.5 w-full">
              {step > 0 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 text-[13px] font-medium hover:bg-zinc-900 hover:text-zinc-200 transition-all duration-200 cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" /> Kembali
                </button>
              )}
              {step < 2 ? (
                <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className={`flex-1 flex items-center justify-center gap-1.5 font-medium text-[13px] py-3 rounded-xl transition-all duration-200 cursor-pointer ${canProceed() ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-zinc-800 text-zinc-100 opacity-40 cursor-not-allowed"}`}>
                  Lanjut <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : idParam ? (
                <div className="flex-1 flex gap-2">
                  <button type="button" onClick={() => { setProjectName(formData.namaBisnis || ""); setSaveActionType("generate"); setShowSavePrompt(true); }} disabled={!canProceed() || isLoading} className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-zinc-700">
                    {isOptimizing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengoptimalkan gambar...</>) : isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>) : ("Generate Ulang")}
                  </button>
                  <button type="button" onClick={() => { setProjectName(formData.namaBisnis || ""); setSaveActionType("update"); setShowSavePrompt(true); }} disabled={!canProceed() || isLoading || !checkHasChanges()} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                    {isOptimizing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengoptimalkan gambar...</>) : isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>) : ("Simpan Perubahan")}
                  </button>
                </div>
              ) : (
                <button id="btn-generate" type="button" onClick={() => { setProjectName(formData.namaBisnis || ""); setSaveActionType("generate"); setShowSavePrompt(true); }} disabled={!canProceed() || isLoading} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 disabled:shadow-none cursor-pointer">
                  {isOptimizing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengoptimalkan gambar...</>) : isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>) : ("Generate Website")}
                </button>
              )}
            </div>

            {/* NEW: Deploy Button */}
            {step === 2 && generatedWebsiteId && (
              <button 
                type="button" 
                onClick={() => setShowDeployModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4" /> Deploy Sekarang &rarr;
              </button>
            )}
          </div>
        </aside>

        {/* ═══ RIGHT PANEL (Preview) ═══ */}
        <main className={`flex-1 bg-zinc-900/50 flex flex-col overflow-hidden p-3 sm:p-5 ${mobilePanel === "preview" ? "flex" : "hidden"} md:flex`}>
          {/* Desktop-only preview controls */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-between mb-3">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-0.5">
              <button type="button" onClick={() => setViewMode("desktop")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${viewMode === "desktop" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button type="button" onClick={() => setViewMode("mobile")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${viewMode === "mobile" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIsEditMode(!isEditMode)} disabled={!templateData} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer border shadow-sm ${isEditMode ? "bg-emerald-600 border-emerald-500 text-white" : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700"} disabled:opacity-30 disabled:cursor-not-allowed`}>
                {isEditMode ? <><Check className="w-3.5 h-3.5" /> Selesai Edit</> : <><Pencil className="w-3.5 h-3.5" /> Edit Teks</>}
              </button>
              <button type="button" onClick={handleOpenFullView} disabled={!templateData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" /> Buka Full View
              </button>
            </div>
          </div>
          {/* Mobile-only: simple toolbar */}
          <div className="flex md:hidden items-center justify-between mb-2">
            <span className="text-[12px] text-zinc-500 font-medium">Preview Website</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setIsEditMode(!isEditMode)} disabled={!templateData} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border shadow-sm ${isEditMode ? "bg-emerald-600 border-emerald-500 text-white" : "bg-indigo-600 border-indigo-500 text-white"} disabled:opacity-30 disabled:cursor-not-allowed`}>
                {isEditMode ? "✅ Selesai" : "✏️ Edit"}
              </button>
              <button type="button" onClick={handleOpenFullView} disabled={!templateData} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
                <ExternalLink className="w-3 h-3" /> Full View
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden relative">
            {/* ── Desktop-only: Desktop/Mobile slide toggle ── */}
            <div className={`hidden md:block absolute inset-0 transition-all duration-500 ease-in-out ${viewMode === "desktop" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}>
              <div className="w-full h-full flex flex-col bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl relative">
                <div className="flex-shrink-0 h-10 bg-zinc-900 border-b border-zinc-800/80 flex items-center px-4 gap-3">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-zinc-700" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-700" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-700" /></div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 bg-zinc-800/80 rounded-lg px-3 py-1 max-w-xs w-full">
                      <Globe className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                      <span className="text-zinc-500 text-[11px] truncate">{templateData?.namaBisnis ? `${templateData.namaBisnis.toLowerCase().replace(/\s+/g, "-")}.buatkanweb.id` : "preview.buatkanweb.id"}</span>
                    </div>
                  </div>
                  <div className="w-[52px]" />
                </div>
                <div ref={desktopFrameRef} className={`flex-1 overflow-y-auto overflow-x-hidden ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}>
                  {templateData ? (
                    <div style={{ height: desktopContentHeight ? desktopContentHeight * desktopScale : undefined }}>
                      <div ref={desktopContentRef} style={{ width: desktopWidth, transform: `scale(${desktopScale})`, transformOrigin: "top left" }}>
                        <TemplateComponent {...templateData} forceMobile={false} isEditable={true} isEditMode={isEditMode} onContentUpdate={(c) => setTemplateData(prev => prev ? { ...prev, ...c } : prev)} websiteId={generatedWebsiteId || undefined} />
                      </div>
                    </div>
                  ) : <EmptyState />}
                </div>
                {isBuilding && <BuildingOverlay mode={formMode} onCancel={() => { abortControllerRef.current?.abort(); setIsBuilding(false); setIsLoading(false); }} />}
              </div>
            </div>
            <div className={`hidden md:block absolute inset-0 transition-all duration-500 ease-in-out ${viewMode === "mobile" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}>
              <div className="h-full flex items-center justify-center p-4">
                <div className={`relative w-[393px] h-[852px] max-h-full shrink-0 border-[8px] border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/40 flex flex-col ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}>
                  <div className={`flex-shrink-0 flex justify-center pt-3 pb-1 z-10 ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}>
                    <div className="w-[126px] h-[37px] bg-black rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700 mr-2" /><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    </div>
                  </div>
                  <div className="h-full w-full">{templateData ? <IframePreview dark={templateData?.warna?.tema === "dark"}><TemplateComponent {...templateData} isEditable={true} isEditMode={isEditMode} onContentUpdate={(c) => setTemplateData(prev => prev ? { ...prev, ...c } : prev)} websiteId={generatedWebsiteId || undefined} /></IframePreview> : <EmptyState />}</div>
                  <div className={`flex-shrink-0 flex justify-center py-2 ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}><div className={`w-32 h-1 rounded-full ${templateData?.warna?.tema === "dark" ? "bg-zinc-700" : "bg-zinc-300"}`} /></div>
                  {isBuilding && <BuildingOverlay mode={formMode} onCancel={() => { abortControllerRef.current?.abort(); setIsBuilding(false); setIsLoading(false); }} />}
                </div>
              </div>
            </div>
            {/* ── Mobile-only: direct inline preview (no device frame) ── */}
            <div className="md:hidden w-full h-full flex flex-col rounded-xl border border-zinc-800 overflow-hidden relative">
              <div className={`flex-1 ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}>
                {templateData ? <IframePreview dark={templateData?.warna?.tema === "dark"}><TemplateComponent {...templateData} isEditable={true} isEditMode={isEditMode} onContentUpdate={(c) => setTemplateData(prev => prev ? { ...prev, ...c } : prev)} websiteId={generatedWebsiteId || undefined} /></IframePreview> : <EmptyState />}
              </div>
              {isBuilding && <BuildingOverlay mode={formMode} onCancel={() => { abortControllerRef.current?.abort(); setIsBuilding(false); setIsLoading(false); }} />}
            </div>
          </div>
        </main>
      </div>

      {/* Back Dialog */}
      {showBackDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Simpan website ini?</h3>
            <p className="text-zinc-400 text-[13px] mb-6 leading-relaxed">
              Perlu diketahui: generate ini tetap mengurangi kuota harian kamu meskipun tidak disimpan.
            </p>
            <div className="flex flex-col w-full gap-2">
              <button
                type="button"
                onClick={handleSaveAndBack}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Simpan ke Dashboard
              </button>
              <button
                type="button"
                onClick={handleDiscardAndBack}
                className="w-full bg-zinc-800 hover:bg-red-900/30 text-zinc-300 hover:text-red-400 font-medium py-2.5 rounded-xl transition-colors border border-zinc-700 hover:border-red-900/50 cursor-pointer"
              >
                Tidak, Buang
              </button>
              <button
                type="button"
                onClick={() => setShowBackDialog(false)}
                className="w-full bg-transparent hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 font-medium py-2.5 rounded-xl transition-colors mt-2 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save/Generate Prompt Dialog */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Nama Project Website</h3>
            <p className="text-zinc-400 text-[13px] mb-5 leading-relaxed">
              Beri nama project ini agar mudah dicari di Dashboard. Nama ini tidak akan terlihat oleh pelanggan Anda.
            </p>
            <div className="mb-6">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Contoh: Landing Page Promo"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveActionType === "generate" ? handleGenerate() : handleSaveUpdate();
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSavePrompt(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => saveActionType === "generate" ? handleGenerate() : handleSaveUpdate()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {saveActionType === "generate" ? "Generate" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {deployStatus === 'success' ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Website berhasil di-deploy! 🎉</h3>
                <p className="text-zinc-400 text-sm mb-6">Website kamu sekarang live dan bisa diakses di internet.</p>
                
                <a 
                  href={`https://${deploySubdomain}.buatkanweb.id`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl mb-6 transition-colors border border-zinc-700 font-medium"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  {deploySubdomain}.buatkanweb.id
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                <div className="w-full flex flex-col gap-2">
                  <a 
                    href={`https://${deploySubdomain}.buatkanweb.id`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Buka Website &rarr;
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeployModal(false);
                      router.push('/dashboard');
                    }}
                    className="w-full bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-2">Deploy Website ke Subdomain</h3>
                <p className="text-zinc-400 text-[13px] mb-5 leading-relaxed">
                  Pilih alamat unik untuk website kamu. Hanya bisa menggunakan huruf kecil, angka, dan tanda hubung (-).
                </p>
                
                <div className="mb-6">
                  <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
                    <input
                      type="text"
                      value={deploySubdomain}
                      onChange={(e) => setDeploySubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="contoh: swarnaworks"
                      className="flex-1 bg-transparent px-4 py-3 text-[14px] text-white focus:outline-none"
                    />
                    <div className="bg-zinc-900 border-l border-zinc-800 px-4 py-3 flex items-center justify-center text-zinc-500 text-[14px]">
                      .buatkanweb.id
                    </div>
                  </div>
                  
                  <div className="mt-2 text-[12px] h-4">
                    {deployStatus === 'checking' && <span className="text-zinc-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Mengecek ketersediaan...</span>}
                    {deployStatus === 'available' && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Subdomain tersedia!</span>}
                    {(deployStatus === 'unavailable' || deployStatus === 'error') && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {deployError}</span>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeployModal(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeploy}
                    disabled={deployStatus !== 'available' || deploySubdomain.length < 3}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {deployStatus === 'deploying' ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Mandeploy...</span>
                    ) : "Deploy \u2192"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ PAYMENT MODAL ═══ */}
      {showPaymentModal && paymentInfo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
              <div className="relative w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
                      <h3 className="text-white font-bold text-[18px]">Ringkasan Pembayaran</h3>
                  </div>
                  <div className="p-6">
                      <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                              <span className="text-zinc-400 text-[13px]">Website</span>
                              <span className="text-white font-medium text-[14px]">{projectName || formData.namaBisnis || "Website Baru"}</span>
                          </div>
                          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                              <span className="text-zinc-400 text-[13px]">Subdomain</span>
                              <span className="text-[#67BAF4] font-medium text-[14px]">{deploySubdomain}.{MAIN_DOMAIN}</span>
                          </div>
                          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                              <span className="text-zinc-400 text-[13px]">Paket</span>
                              <span className="text-white font-medium text-[14px]">Aktivasi (bulan pertama)</span>
                          </div>
                          
                          <div className="pt-2">
                              {paymentInfo.isEarlyAdopter && (
                                  <div className="mb-3 flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[12px] font-medium px-3 py-2 rounded-lg border border-emerald-500/20">
                                      <span>🎉</span> Kamu termasuk 75 early adopter!
                                  </div>
                              )}
                              <div className="flex justify-between items-end">
                                  <span className="text-zinc-300 font-medium">Total Harga</span>
                                  <div className="text-right">
                                      {paymentInfo.isEarlyAdopter && (
                                          <div className="text-zinc-500 line-through text-[13px] mb-1">
                                              Rp199.000
                                          </div>
                                      )}
                                      <div className="text-2xl font-bold text-white">
                                          Rp{paymentInfo.harga.toLocaleString('id-ID')}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-3">
                          <button
                              onClick={() => setShowPaymentModal(false)}
                              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
                          >
                              Batal
                          </button>
                          <button
                              onClick={handleBayarSekarang}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
                          >
                              Bayar Sekarang
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ═══ SAVE SUCCESS OVERLAY ═══ */}
      {saveStatus === 'success' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-xl border border-zinc-800 animate-scale-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Perubahan berhasil disimpan
            </h3>
            <p className="text-sm text-zinc-400">
              Website kamu sudah diperbarui
              {websiteSubdomain && (
                <> dan bisa dilihat di{' '}
                  <span className="font-medium text-zinc-300">
                    {websiteSubdomain}.buatkanweb.id
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-zinc-500 mt-4">
              Mengalihkan ke dashboard...
            </p>
          </div>
        </div>
      )}

      {/* ═══ SAVE ERROR TOAST ═══ */}
      {saveStatus === 'error' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in text-[13px] font-medium">
          Gagal menyimpan. Coba lagi.
        </div>
      )}
    </div>
  );
}

export default function BuatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="text-white text-sm">Memuat...</div>
      </div>
    }>
      <BuatContent />
    </Suspense>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-5"><Monitor className="w-7 h-7 text-zinc-300" /></div>
      <h3 className="text-zinc-400 text-[16px] font-semibold mb-2">Preview Website Anda</h3>
      <p className="text-zinc-300 text-[13px] max-w-sm leading-relaxed mb-6">Isi formulir konfigurasi di panel sebelah kiri, lalu klik <span className="text-indigo-400 font-medium">Generate Website</span> untuk merakit landing page secara otomatis.</p>
      <div className="flex items-center gap-2 text-zinc-300 text-[12px]"><ArrowLeft className="w-3.5 h-3.5" /><span>Isi form di samping untuk memulai</span></div>
    </div>
  );
}

function BuildingOverlay({ onCancel, mode = "jasa" }: { onCancel: () => void; mode?: "jasa" | "portfolio" }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const loadingMessages = mode === "portfolio"
    ? [
        "Memahami portofoliomu...",
        "Menyusun narasi personal branding...",
        "Merancang struktur website...",
        "Hampir selesai..."
      ]
    : [
        "Memahami bisnis kamu...",
        "Menyusun copywriting...",
        "Merancang struktur website...",
        "Hampir selesai..."
      ];

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % loadingMessages.length);
    }, 3000);
    const secInterval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      clearInterval(msgInterval);
      clearInterval(secInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center z-20 transition-opacity duration-300">
      <div className="flex flex-col items-center gap-5 max-w-xs text-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="space-y-1">
          <p className="text-white text-[15px] font-medium">{loadingMessages[msgIndex]}</p>
          <p className="text-zinc-500 text-[12px]">{seconds} detik berjalan...</p>
        </div>
        <button 
          onClick={onCancel}
          className="mt-4 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-[12px] font-medium cursor-pointer"
        >
          Batalkan
        </button>
      </div>
    </div>
  );
}
