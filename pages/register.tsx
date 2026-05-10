import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm: '', title: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options:  {
        data: {
          full_name: form.full_name,
          title:     form.title,
          role:      'auditor',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Register — Pioneers Audit System</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-dark-50 p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-luxury-lg p-10 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image src="/logo.png" alt="Pioneers" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-semibold text-dark-900">Create Account</h1>
            <p className="text-dark-500 text-sm mt-1">Join the Pioneers Audit Platform</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-900 mb-2">Account Created!</h3>
              <p className="text-dark-500 text-sm mb-6">
                Please check your email to verify your account.
              </p>
              <button onClick={() => router.push('/login')} className="btn-primary">
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Full Name</label>
                    <input name="full_name" type="text" className="input"
                      placeholder="John Smith" value={form.full_name}
                      onChange={handleChange} required />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Job Title</label>
                    <input name="title" type="text" className="input"
                      placeholder="Lead Auditor" value={form.title}
                      onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Email Address</label>
                    <input name="email" type="email" className="input"
                      placeholder="you@pioneers.com" value={form.email}
                      onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <input name="password" type={showPass ? 'text' : 'password'}
                        className="input pr-10" placeholder="Min. 8 characters"
                        value={form.password} onChange={handleChange} required />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input name="confirm" type="password" className="input"
                      placeholder="Repeat password" value={form.confirm}
                      onChange={handleChange} required />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <UserPlus size={16} />}
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-dark-500 mt-6">
                Already have an account?{' '}
                <a href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                  Sign In
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}