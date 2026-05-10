import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Profile } from '../types'

let cachedProfile: Profile | null = null

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(cachedProfile)
  const [loading, setLoading] = useState(!cachedProfile)

  useEffect(() => {
    if (cachedProfile) {
      setProfile(cachedProfile)
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        // Try to get existing profile
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        // If no profile, create one
        if (error || !data) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id:        user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email:     user.email || '',
              role:      user.user_metadata?.role || 'auditor',
            })
            .select()
            .single()
          data = newProfile
        }

        if (data) {
          cachedProfile = data as Profile
          setProfile(data as Profile)
        }
      } catch (e) {
        console.error('Profile error:', e)
      } finally {
        setLoading(false)
      }
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        cachedProfile = null
        setProfile(null)
      } else if (event === 'SIGNED_IN') {
        cachedProfile = null
        load()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const refresh = async () => {
    cachedProfile = null
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) { cachedProfile = data as Profile; setProfile(data as Profile) }
  }

  return { profile, loading, refresh }
}