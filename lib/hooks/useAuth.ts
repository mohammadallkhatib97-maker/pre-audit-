import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabase'
import { User } from '@supabase/supabase-js'

export function useAuth(redirectTo = '/login') {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace(redirectTo)
      setUser(user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) router.replace(redirectTo)
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [router, redirectTo])

  return { user, loading }
}