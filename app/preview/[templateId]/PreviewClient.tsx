'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { safeStorage } from '@/lib/storage'
import { getTemplateComponent, getTemplateKategori } from '@/lib/templateRegistry'
import type { TemplateData } from '@/types'

export default function PreviewClient({
    templateId,
    templateName,
    isEmbed,
    data
}: {
    templateId: string,
    templateName: string | null,
    isEmbed: boolean,
    data: TemplateData
}) {
    const router = useRouter()
    const TemplateComponent = getTemplateComponent(templateId)
    const kategori = getTemplateKategori(templateId)

    const handleSelect = () => {
        safeStorage.set('selected_template', templateId)
        safeStorage.set('selected_kategori', kategori)
        router.push('/buat')
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Hide Next.js dev indicators */}
            <style>{`
                #__next-build-watcher,
                nextjs-portal,
                [data-nextjs-dialog],
                [data-nextjs-toast],
                [data-nextjs-dialog-overlay] {
                    display: none !important;
                }
            `}</style>

            {/* Top Bar — hidden in embed mode */}
            {!isEmbed && (
                <div className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-white/10 h-12 flex items-center justify-between px-4 sm:px-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-[13px] font-medium transition-colors cursor-pointer group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Kembali
                    </button>

                    <span className="text-zinc-500 text-[12px] font-medium hidden sm:block">
                        Preview Template — <span className="text-zinc-300">{templateName || data.namaBisnis || 'Website'}</span>
                    </span>

                    <button
                        onClick={handleSelect}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-[#1E466B] to-[#255580] hover:from-[#255580] hover:to-[#1E466B] text-white text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-[#1E466B]/20 cursor-pointer"
                    >
                        Pilih Template Ini →
                    </button>
                </div>
            )}

            {/* Template Preview — transform-gpu agar navbar `fixed` di dalam template
                ter-scope ke area ini (tidak menumpuk dengan top bar preview) */}
            <div className="flex-1 transform-gpu">
                <TemplateComponent {...data} />
            </div>
        </div>
    )
}
