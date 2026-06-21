import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth'
import DashboardClient from './DashboardClient'

export const metadata = {
    title: 'Dashboard',
}

interface Website {
    id: string
    nama_bisnis: string
    kategori_jasa: string
    status: 'preview' | 'active' | 'expired'
    created_at: string
    expires_at: string | null
    subdomain: string | null
}

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // 1. Auto-delete expired preview websites
    await supabase
        .from('websites')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'preview')
        .lt('expires_at', new Date().toISOString())

    // 2. Ambil websites + hitung generate hari ini secara PARALEL (query independen).
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [{ data: websites }, { count: todayCount }] = await Promise.all([
        supabase
            .from('websites')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        supabase
            .from('generate_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString()),
    ])

    const allWebsites: Website[] = websites?.map(w => ({
        id: w.id,
        nama_bisnis: w.nama_usaha || "",
        kategori_jasa: w.kategori || "",
        status: w.status,
        created_at: w.created_at,
        expires_at: w.expires_at,
        subdomain: w.subdomain || null
    })) ?? []
    const generatedToday = todayCount ?? 0
    const totalWebsites = allWebsites.length
    const activeWebsites = allWebsites.filter(w => w.status === 'active').length

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
    const userEmail = user.email || ''
    const userAvatar = user.user_metadata?.avatar_url || null

    return (
        <DashboardClient
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            websites={allWebsites}
            generatedToday={generatedToday}
            totalWebsites={totalWebsites}
            activeWebsites={activeWebsites}
            isAdmin={isAdmin(user)}
        />
    )
}
