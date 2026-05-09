import Link from 'next/link'

export default function SubdomainNotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                {/* 404 Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-red-400 text-[12px] font-semibold tracking-wide">WEBSITE TIDAK DITEMUKAN</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                    404
                </h1>
                <p className="text-zinc-400 text-[15px] leading-relaxed mb-8">
                    Website yang kamu cari belum terdaftar atau sudah tidak aktif.
                    Pastikan alamat subdomain sudah benar.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="https://buatkanweb.id"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1E466B] to-[#67BAF4] text-white font-semibold text-[14px] px-6 py-3 rounded-xl transition-all hover:opacity-90 shadow-lg shadow-[#1E466B]/25"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                        Buat Website Gratis
                    </Link>
                    <Link
                        href="https://buatkanweb.id"
                        className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-[14px] px-6 py-3 rounded-xl transition-colors border border-zinc-700"
                    >
                        Ke Beranda
                    </Link>
                </div>

                {/* Branding */}
                <p className="text-zinc-600 text-[12px] mt-12">
                    Powered by <span className="text-zinc-400 font-medium">BuatkanWeb<span className="text-[#67BAF4]">.id</span></span>
                </p>
            </div>
        </div>
    )
}
