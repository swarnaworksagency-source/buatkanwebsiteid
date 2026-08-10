import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth'
import { AGENT_ENABLED } from '@/lib/features'
import AgentClient from './AgentClient'

export const metadata = {
    title: 'Agent',
}

export default async function AgentPage() {
    // Fitur Agent dimatikan — jangan render halaman, balikkan ke dashboard.
    if (!AGENT_ENABLED) {
        redirect('/dashboard')
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
    const userEmail = user.email || ''
    const userAvatar = user.user_metadata?.avatar_url || null

    return (
        <AgentClient
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            isAdmin={isAdmin(user)}
        />
    )
}
