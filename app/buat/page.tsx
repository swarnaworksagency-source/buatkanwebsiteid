"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TemplateData, FormData, PaketHarga } from "@/types";
import TemplateSatu from "@/components/templates/TemplateSatu";
import { createClient } from "@/lib/supabase";
import { convertToWebP, convertAllToWebP } from "@/lib/imageUtils";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { safeStorage } from '@/lib/storage';
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import {
  Monitor, Smartphone, Loader2, Globe, Pencil,
  ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Eye, PenLine,
  Building2, Phone, AlignLeft, Award, MapPin, Target, Palette,
  Upload, ImagePlus, ExternalLink, Sun, Moon, Check, X, Pipette,
  Plus, Trash2, DollarSign, Camera, ChevronUp, ChevronDown, Star,
  Mail, AtSign, Hash, Type, Rocket, CheckCircle2, AlertCircle
} from "lucide-react";

/* ═══ CONSTANTS ═══ */
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
  { label: "Profil Dasar", icon: Building2 },
  { label: "Detail Bisnis", icon: Target },
  { label: "Visual & Aset", icon: Palette },
];
const NUANSA_OPTIONS = [
  { value: "dark" as const, label: "Dark Mode", desc: "Elegan & Mewah", icon: Moon, preview: "bg-zinc-900 border-zinc-700" },
  { value: "light" as const, label: "Light Mode", desc: "Bersih & Terang", icon: Sun, preview: "bg-white border-zinc-200" },
];
const INITIAL_FORM: FormData = {
  namaBisnis: "", tagline: "", kategoriJasa: "", lokasi: "", nomorWhatsApp: "",
  telepon: "", email: "", instagram: "", x_twitter: "", tiktok: "",
  keunggulan: "", layananSpesifik: [], usia: [], statusKeluarga: [], pekerjaan: [], gayaHidup: [], paketHarga: [],
  tema: "", primaryColor: "#4f46e5", logo: "", fotoBisnis: [], portofolio: [],
};
const inputClass = "w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-[13px] text-zinc-100 placeholder:text-zinc-600 placeholder:italic focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-200";
const EMPTY_PAKET: PaketHarga = { namaPaket: "", harga: "", fitur: [], isPopuler: false };

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

  const [isLoading, setIsLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [mobilePanel, setMobilePanel] = useState<"form" | "preview">("form");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const fotoBisnisInputRef = useRef<HTMLInputElement>(null);
  const portofolioInputRef = useRef<HTMLInputElement>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // File objects store — keeps actual File references for reliable upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fotoBisnisFiles, setFotoBisnisFiles] = useState<File[]>([]);
  const [portofolioFiles, setPortofolioFiles] = useState<File[]>([]);

  const [kategoriSuggestions, setKategoriSuggestions] = useState<string[]>([]);
  const [layananOptions, setLayananOptions] = useState<string[]>([]);

  useEffect(() => {
    const selectedKategori = typeof window !== 'undefined' ? safeStorage.get("selected_kategori") : null;

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
    if (selectedKategori === "fnb" || selectedKategori === "kreatif") return;

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

      setFormData(loadedFormData);

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

  const handleDeploy = async () => {
    if (deployStatus !== 'available' || !generatedWebsiteId) return;
    
    setDeployStatus('deploying');
    try {
      const supabase = createClient();

      // STEP 1: Simpan perubahan konten terbaru (termasuk inline edits) ke DB dulu
      if (templateData) {
        // Use clean uploaded URLs from templateData, not stale blob URLs from formData
        const cleanFormData = {
          ...formData,
          logo: templateData.logo || formData.logo,
          portofolio: templateData.portofolio || formData.portofolio,
        };
        const latestContent = { ...templateData, __formData: cleanFormData };
        const { error: contentError } = await supabase
          .from('websites')
          .update({ 
            generated_content: latestContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', generatedWebsiteId);

        if (contentError) throw contentError;
      }

      // STEP 2: Baru deploy (set subdomain + status active)
      const { error } = await supabase
        .from('websites')
        .update({ 
          subdomain: deploySubdomain,
          status: 'active'
        })
        .eq('id', generatedWebsiteId);

      if (error) throw error;
      setDeployStatus('success');
    } catch (err: any) {
      setDeployStatus('error');
      setDeployError(err.message || "Gagal deploy website");
    }
  };

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }, []
  );

  const canProceed = (): boolean => {
    if (step === 0) return !!(formData.namaBisnis.trim() && formData.kategoriJasa.trim() && formData.lokasi && formData.nomorWhatsApp.trim());
    if (step === 1) return !!(
      formData.layananSpesifik.length > 0 &&
      formData.keunggulan.trim() &&
      formData.usia.length > 0 &&
      formData.statusKeluarga.length > 0 &&
      formData.pekerjaan.length > 0 &&
      formData.gayaHidup.length > 0
    );
    if (step === 2) return !!formData.tema;
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
    const fileArray = Array.from(files);
    const newUrls = fileArray.map((f) => URL.createObjectURL(f));
    if (field === "fotoBisnis") setFotoBisnisFiles(prev => [...prev, ...fileArray]);
    else setPortofolioFiles(prev => [...prev, ...fileArray]);
    updateField(field, [...formData[field], ...newUrls]);
  };
  const handlePhotoRemove = (index: number, field: "fotoBisnis" | "portofolio") => {
    URL.revokeObjectURL(formData[field][index]);
    if (field === "fotoBisnis") setFotoBisnisFiles(prev => prev.filter((_, i) => i !== index));
    else setPortofolioFiles(prev => prev.filter((_, i) => i !== index));
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
        throw new Error("Kamu sudah generate 3x hari ini. Coba lagi besok pukul 00.00 WIB");
      }

      // Upload function — uses File objects directly for reliable upload
      const uploadFile = async (file: File, folder: string) => {
        try {
          const fileExt = file.name.split('.').pop() || 'png';
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('website-assets')
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from('website-assets').getPublicUrl(filePath);
          return publicUrlData.publicUrl;
        } catch (e: any) {
          console.error("Upload error:", e);
          throw new Error(`Gagal upload gambar (${folder}). Detail: ${e.message || 'Kesalahan tidak diketahui'}.`);
        }
      };

      // Optimize images before upload
      setIsOptimizing(true);
      const optimizedLogo = logoFile ? await convertToWebP(logoFile, 0.9).catch(() => logoFile) : null;
      const optimizedPortofolio = portofolioFiles.length > 0 
        ? await convertAllToWebP(portofolioFiles, 0.85).catch(() => portofolioFiles) 
        : portofolioFiles;
      setIsOptimizing(false);

      let logoUrl = "";
      if (optimizedLogo) {
        logoUrl = await uploadFile(optimizedLogo, 'logos');
      } else if (formData.logo && !formData.logo.startsWith('blob:')) {
        logoUrl = formData.logo; // Already uploaded URL
      }

      // Parallelize portofolio uploads
      const portofolioUploadPromises = formData.portofolio.map(async (url, i) => {
        if (url.startsWith('blob:') && optimizedPortofolio[i]) {
          return await uploadFile(optimizedPortofolio[i], 'portofolio');
        } else if (!url.startsWith('blob:')) {
          return url; // Already uploaded URL
        }
        return "";
      });
      const portofolioUrls = (await Promise.all(portofolioUploadPromises)).filter(url => url !== "");

      // Call API
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        layanan: aiData.layanan || [],
        targetPelanggan: aiData.targetPelanggan || { deskripsi: "", painPoint: "", solusi: "" },
        testimonialPlaceholder: aiData.testimonialPlaceholder || [],
        footer: aiData.footer || { tagline: "", ctaText: "" },

        namaBisnis: formData.namaBisnis,
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
        logo: logoUrl,
        portofolio: portofolioUrls,
        fotoBisnis: [], // Can be expanded later if needed
      };

      // Save to DB
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      const templateId = safeStorage.get('selected_template') || 'jasa-001';

      let dbData, dbError;

      const payload = {
        user_id: user.id,
        nama_usaha: projectName || formData.namaBisnis || "Website Baru",
        deskripsi: formData.tagline || aiData.hero?.subheadline || "",
        kategori: formData.kategoriJasa,
        logo_url: logoUrl,
        foto_urls: portofolioUrls,
        generated_content: { ...finalData, __formData: { ...formData, logo: logoUrl, portofolio: portofolioUrls } },
        template_id: templateId,
        status: 'preview',
        expires_at: expiresAt.toISOString()
      };

      if (idParam) {
        const { data, error } = await supabase.from('websites').update(payload).eq('id', idParam).select('id').single();
        dbData = data; dbError = error;
      } else {
        const { data, error } = await supabase.from('websites').insert(payload).select('id').single();
        dbData = data; dbError = error;
      }

      if (dbError) {
        console.error("DB Error:", dbError);
        throw new Error("Gagal menyimpan data website ke database.");
      }

      if (dbData?.id) {
        setGeneratedWebsiteId(dbData.id);

        // Log generate action for quota tracking
        await supabase.from('generate_logs').insert({
          user_id: user.id,
          website_id: dbData.id,
        });
      }

      setTemplateData(finalData);

      // Show building animation for a few seconds if stream finishes too quickly
      // Now that we have streaming, we don't need artificial delay, but we'll leave a small 1s buffer for UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStep(2); // Lanjut ke step 3
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
      kategori: formData.kategoriJasa,
      lokasi: formData.lokasi,
      kontak: { wa: formData.nomorWhatsApp, telepon: formData.telepon, email: formData.email },
      sosmed: { instagram: formData.instagram, tiktok: formData.tiktok, twitter: formData.x_twitter },
      warna: { primary: formData.primaryColor, tema: (formData.tema || "light") as "dark" | "light" },
      paketHarga: formData.paketHarga,
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

      // Upload function — uses File objects directly for reliable upload
      const uploadFile = async (file: File, folder: string) => {
        try {
          const fileExt = file.name.split('.').pop() || 'png';
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${folder}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('website-assets').upload(filePath, file, { upsert: true });
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('website-assets').getPublicUrl(filePath);
          return publicUrlData.publicUrl;
        } catch (e: any) {
          console.error("Upload error:", e);
          throw new Error(`Gagal upload gambar (${folder}). Detail: ${e.message || 'Kesalahan tidak diketahui'}.`);
        }
      };

      // Optimize images before upload
      setIsOptimizing(true);
      const optimizedLogo = logoFile ? await convertToWebP(logoFile, 0.9).catch(() => logoFile) : null;
      const optimizedPortofolio = portofolioFiles.length > 0 
        ? await convertAllToWebP(portofolioFiles, 0.85).catch(() => portofolioFiles) 
        : portofolioFiles;
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

      // Parallelize portofolio uploads
      let portofolioUrls: string[] = [];
      if (formData.portofolio.length > 0) {
        const portofolioUploadPromises = formData.portofolio.map(async (url, i) => {
          if (url.startsWith('blob:') && optimizedPortofolio[i]) {
            return await uploadFile(optimizedPortofolio[i], 'portofolio');
          } else if (!url.startsWith('blob:')) {
            return url;
          }
          return "";
        });
        portofolioUrls = (await Promise.all(portofolioUploadPromises)).filter(url => url !== "");
      }
      // Fallback: if all portofolio URLs were stale blobs with no File objects, keep existing ones
      if (portofolioUrls.length === 0 && templateData?.portofolio && templateData.portofolio.length > 0) {
        portofolioUrls = templateData.portofolio.filter(url => !url.startsWith('blob:'));
      }

      // Merge current templateData with new formData
      const updatedContent: TemplateData = {
        ...(templateData || ({} as TemplateData)),
        namaBisnis: formData.namaBisnis,
        kategori: formData.kategoriJasa,
        lokasi: formData.lokasi,
        kontak: { wa: formData.nomorWhatsApp, telepon: formData.telepon, email: formData.email },
        sosmed: { instagram: formData.instagram, tiktok: formData.tiktok, twitter: formData.x_twitter },
        warna: { primary: formData.primaryColor, tema: (formData.tema || "light") as "dark" | "light" },
        paketHarga: formData.paketHarga,
        logo: logoUrl,
        portofolio: portofolioUrls,
      };

      // Save clean URLs in __formData so next load won't have stale blob URLs
      const cleanFormData = {
        ...formData,
        logo: logoUrl,
        portofolio: portofolioUrls,
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
            <div className="flex items-center gap-1.5 mb-4">
              {STEP_INFO.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step, isDone = i < step;
                return (
                  <div key={i} className="flex items-center gap-1.5 flex-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? "bg-indigo-600 shadow-lg shadow-indigo-500/30" : isDone ? "bg-indigo-600/20 border border-indigo-500/30" : "bg-zinc-800/60 border border-zinc-800"}`}>
                      {isDone ? <Check className="w-3 h-3 text-indigo-400" /> : <Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-zinc-600"}`} />}
                    </div>
                    {i < STEP_INFO.length - 1 && <div className={`flex-1 h-px transition-colors duration-300 ${isDone ? "bg-indigo-500/40" : "bg-zinc-800"}`} />}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {(() => { const StepIcon = STEP_INFO[step].icon; return <StepIcon className="w-4 h-4 text-indigo-400" />; })()}
              <h2 className="font-semibold text-[14px] text-zinc-100">
                Step {step + 1} of 3: <span className="text-zinc-400 font-normal">{STEP_INFO[step].label}</span>
              </h2>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* ═══ STEP 1 ═══ */}
            {step === 0 && (
              <>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Building2 className="w-3 h-3" /> Nama Bisnis</label>
                  <input id="input-nama-bisnis" type="text" value={formData.namaBisnis} onChange={(e) => updateField("namaBisnis", e.target.value)} placeholder="contoh: Sejuk Prima AC" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Type className="w-3 h-3" /> Tagline</label>
                  <input id="input-tagline" type="text" value={formData.tagline} onChange={(e) => updateField("tagline", e.target.value)} placeholder="contoh: Solusi AC Terpercaya untuk Kenyamanan Anda" className={inputClass} />
                  <p className="text-zinc-600 text-[11px]">Slogan singkat yang menggambarkan bisnis Anda</p>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Award className="w-3 h-3" /> Kategori Jasa</label>
                  <AutocompleteInput id="input-kategori" value={formData.kategoriJasa} onChange={(v) => updateField("kategoriJasa", v)} suggestions={kategoriSuggestions} placeholder="contoh: Servis AC" />
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
                      <input id="input-whatsapp" type="text" value={formData.nomorWhatsApp} onChange={(e) => updateField("nomorWhatsApp", e.target.value)} placeholder="628xxx" className={`${inputClass} !py-2 !text-[12px]`} />
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
                      <input id="input-ig" type="text" value={formData.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="@username" className={`${inputClass} !py-2 !text-[12px]`} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">TikTok</label>
                      <input id="input-tiktok" type="text" value={formData.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} placeholder="@username" className={`${inputClass} !py-2 !text-[12px]`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">X (Twitter)</label>
                    <input id="input-twitter" type="text" value={formData.x_twitter} onChange={(e) => updateField("x_twitter", e.target.value)} placeholder="@username" className={`${inputClass} !py-2 !text-[12px]`} />
                  </div>
                </div>
              </>
            )}

            {/* ═══ STEP 2 ═══ */}
            {step === 1 && (
              <>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><AlignLeft className="w-3 h-3" /> Keunggulan Bisnis</label>
                  <textarea id="input-keunggulan" value={formData.keunggulan} onChange={(e) => updateField("keunggulan", e.target.value)} placeholder="contoh: Berpengalaman 10 tahun, garansi 30 hari, teknisi bersertifikat..." rows={3} className={`${inputClass} resize-none`} />
                  <p className="text-zinc-600 text-[11px]">Tulis keunggulan unik yang membedakan bisnis Anda</p>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Award className="w-3 h-3" /> Layanan Spesifik</label>
                  <MultiSelectDropdown id="input-layanan" value={formData.layananSpesifik} onChange={(val) => updateField("layananSpesifik", val)} options={layananOptions} placeholder="Pilih layanan..." />
                </div>
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
                      <input type="text" value={paket.namaPaket} onChange={(e) => updatePaket(idx, "namaPaket", e.target.value)}
                        placeholder="contoh: Paket Hemat" className={`${inputClass} !py-2 !text-[12px]`} />
                      <input type="text" value={paket.harga} onChange={(e) => updatePaket(idx, "harga", e.target.value)}
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
                          <input type="text" placeholder="Ketik fitur + Enter"
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

            {/* ═══ STEP 3 ═══ */}
            {step === 2 && (
              <>
                {/* Theme */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Palette className="w-3 h-3" /> Nuansa Desain</label>
                  <div className="grid grid-cols-2 gap-3">
                    {NUANSA_OPTIONS.map((opt) => {
                      const Icon = opt.icon; const isSelected = formData.tema === opt.value;
                      return (
                        <button key={opt.value} type="button" onClick={() => updateField("tema", opt.value)}
                          className={`group flex flex-col items-center gap-2.5 p-5 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5" : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"}`}>
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

                {/* Logo Upload */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><ImagePlus className="w-3 h-3" /> Logo Bisnis</label>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
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

                {/* Foto Bisnis Upload */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Camera className="w-3 h-3" /> Foto Bisnis</label>
                  <p className="text-zinc-600 text-[10px] -mt-1">Suasana kerja, toko, atau tim Anda</p>
                  <input ref={fotoBisnisInputRef} type="file" accept="image/*" multiple className="hidden"
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

                {/* Portofolio Upload */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 uppercase tracking-wider"><Upload className="w-3 h-3" /> Foto Portofolio</label>
                  <p className="text-zinc-600 text-[10px] -mt-1">Hasil karya atau proyek yang sudah selesai</p>
                  <input ref={portofolioInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => { if (e.target.files) handlePhotosSelect(e.target.files, "portofolio"); e.target.value = ""; }} />
                  <div onClick={() => portofolioInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "portofolio")}
                    className="border-2 border-dashed border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors group cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-2 group-hover:bg-zinc-700/80 transition-colors">
                        <Upload className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <p className="text-[12px] text-zinc-300 font-medium mb-0.5">Foto Portofolio</p>
                      <p className="text-[10px] text-zinc-600">Seret atau <span className="text-indigo-400">klik untuk upload</span></p>
                    </div>
                  </div>
                  {formData.portofolio.length > 0 && (
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
                  )}
                </div>
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
                <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className={`flex-1 flex items-center justify-center gap-1.5 font-medium text-[13px] py-3 rounded-xl transition-all duration-200 cursor-pointer ${canProceed() ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20" : "bg-zinc-800 text-zinc-100 opacity-40 cursor-not-allowed"}`}>
                  Lanjut <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : idParam ? (
                <div className="flex-1 flex gap-2">
                  <button type="button" onClick={() => { setProjectName(formData.namaBisnis || ""); setSaveActionType("generate"); setShowSavePrompt(true); }} disabled={!canProceed() || isLoading} className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer border border-zinc-700">
                    {isOptimizing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengoptimalkan gambar...</>) : isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>) : ("Generate Ulang")}
                  </button>
                  <button type="button" onClick={() => { setProjectName(formData.namaBisnis || ""); setSaveActionType("update"); setShowSavePrompt(true); }} disabled={!canProceed() || isLoading || !checkHasChanges()} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 cursor-pointer">
                    {isOptimizing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengoptimalkan gambar...</>) : isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>) : ("Simpan Perubahan")}
                  </button>
                </div>
              ) : (
                <button id="btn-generate" type="button" onClick={() => { setProjectName(formData.namaBisnis || ""); setSaveActionType("generate"); setShowSavePrompt(true); }} disabled={!canProceed() || isLoading} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:shadow-none cursor-pointer">
                  {isOptimizing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengoptimalkan gambar...</>) : isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>) : ("Generate Website")}
                </button>
              )}
            </div>

            {/* NEW: Deploy Button */}
            {step === 2 && generatedWebsiteId && (
              <button 
                type="button" 
                onClick={() => setShowDeployModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium text-[13px] py-3.5 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
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
                <div className={`flex-1 overflow-y-auto ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}>{templateData ? <TemplateSatu {...templateData} forceMobile={false} isEditable={true} isEditMode={isEditMode} onContentUpdate={(c) => setTemplateData(prev => prev ? { ...prev, ...c } : prev)} websiteId={generatedWebsiteId || undefined} /> : <EmptyState />}</div>
                {isBuilding && <BuildingOverlay onCancel={() => { abortControllerRef.current?.abort(); setIsBuilding(false); setIsLoading(false); }} />}
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
                  <div className="h-full w-full overflow-y-auto">{templateData ? <TemplateSatu {...templateData} forceMobile={true} isEditable={true} isEditMode={isEditMode} onContentUpdate={(c) => setTemplateData(prev => prev ? { ...prev, ...c } : prev)} websiteId={generatedWebsiteId || undefined} /> : <EmptyState />}</div>
                  <div className={`flex-shrink-0 flex justify-center py-2 ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}><div className={`w-32 h-1 rounded-full ${templateData?.warna?.tema === "dark" ? "bg-zinc-700" : "bg-zinc-300"}`} /></div>
                  {isBuilding && <BuildingOverlay onCancel={() => { abortControllerRef.current?.abort(); setIsBuilding(false); setIsLoading(false); }} />}
                </div>
              </div>
            </div>
            {/* ── Mobile-only: direct inline preview (no device frame) ── */}
            <div className="md:hidden w-full h-full flex flex-col rounded-xl border border-zinc-800 overflow-hidden relative">
              <div className={`flex-1 overflow-y-auto ${templateData?.warna?.tema === "dark" ? "bg-zinc-950" : "bg-white"}`}>
                {templateData ? <TemplateSatu {...templateData} forceMobile={true} isEditable={true} isEditMode={isEditMode} onContentUpdate={(c) => setTemplateData(prev => prev ? { ...prev, ...c } : prev)} websiteId={generatedWebsiteId || undefined} /> : <EmptyState />}
              </div>
              {isBuilding && <BuildingOverlay onCancel={() => { abortControllerRef.current?.abort(); setIsBuilding(false); setIsLoading(false); }} />}
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
                    className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
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
                    {deployStatus === 'unavailable' && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {deployError}</span>}
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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
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

function BuildingOverlay({ onCancel }: { onCancel: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const loadingMessages = [
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
