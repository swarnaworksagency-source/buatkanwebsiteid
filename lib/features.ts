// Feature flag terpusat.
//
// AGENT_ENABLED — fitur "Agent Jadwal" (bot WhatsApp / schema `wabot`).
// Dinonaktifkan 2026-08-10: proses PM2 `wabot` di VPS di-stop, masa uji coba
// selesai, menunggu migrasi ke WhatsApp Cloud API resmi. Kode UI + route admin
// sengaja TIDAK dihapus — cukup balikkan flag ini ke `true` untuk menyalakan lagi.
export const AGENT_ENABLED = false
