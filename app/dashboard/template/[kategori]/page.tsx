import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import KategoriTemplateClient from './KategoriTemplateClient'
import { KATEGORI_LABELS } from '@/lib/templates'

export async function generateMetadata({ params }: { params: Promise<{ kategori: string }> }) {
    const { kategori } = await params
    return { title: KATEGORI_LABELS[kategori] || 'Template' }
}

export default async function KategoriTemplatePage({ params }: { params: Promise<{ kategori: string }> }) {
    const { kategori } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')
    if (!['jasa', 'fnb', 'kreatif', 'personal', 'peternakan', 'toko'].includes(kategori)) redirect('/dashboard/template')

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
    const userEmail = user.email || ''
    const userAvatar = user.user_metadata?.avatar_url || null

    return (
        <KategoriTemplateClient
            kategori={kategori}
            kategoriLabel={KATEGORI_LABELS[kategori]}
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
        />
    )
}
