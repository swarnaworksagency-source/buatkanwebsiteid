'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                setUser(user)
            } catch (err) {
                // Refresh token basi/expired → bersihkan session lokal supaya cookie tidak nyangkut
                console.warn('Sesi tidak valid, membersihkan session:', err)
                await supabase.auth.signOut()
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        getUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // Token refresh gagal → anggap logout
                if (event === 'TOKEN_REFRESHED' && !session) {
                    setUser(null)
                } else {
                    setUser(session?.user ?? null)
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const signOut = useCallback(async () => {
        await supabase.auth.signOut()
        setUser(null)
        window.location.href = '/'
    }, [supabase])

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
