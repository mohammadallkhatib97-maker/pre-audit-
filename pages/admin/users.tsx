import { useEffect, useState } from 'react'
import Layout from '../../components/layout/Layout'
import PageHeader from '../../components/ui/PageHeader'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../lib/hooks/useProfile'
import { Profile } from '../../lib/types'
import { formatDate, getInitials } from '../../lib/utils'
import { Shield, User, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/router'

export default function AdminUsersPage() {
  const { profile } = useProfile()
  const router      = useRouter()
  const [users, setUsers]   = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && profile.role !== 'admin') router.replace('/dashboard')
    if (profile?.role === 'admin') fetchUsers()
  }, [profile])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setUsers(data || [])
    setLoading(false)
  }

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'auditor' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    fetchUsers()
  }

  const toggleActive = async (userId: string, current: boolean) => {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', userId)
    fetchUsers()
  }

  return (
    <Layout title="User Management">
      <PageHeader
        title="User Management"
        subtitle={`${users.length} registered users`}
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admin' }, { label: 'Users' }]}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Title</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center
                                        text-brand-700 text-xs font-semibold">
                          {getInitials(user.full_name)}
                        </div>
                        <span className="font-medium text-sm text-dark-800">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-dark-500">{user.email}</td>
                    <td className="text-sm text-dark-500">{user.title || '—'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>
                        {user.role === 'admin' ? '⬡ Admin' : '⬡ Auditor'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-sm text-dark-400">{formatDate(user.created_at)}</td>
                    <td>
                      {user.id !== profile?.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRole(user.id, user.role)}
                            title="Toggle Role"
                            className="p-1.5 hover:bg-brand-50 rounded-lg text-dark-400
                                       hover:text-brand-600 transition-colors">
                            <Shield size={13} />
                          </button>
                          <button
                            onClick={() => toggleActive(user.id, user.is_active)}
                            title="Toggle Active"
                            className="p-1.5 hover:bg-dark-100 rounded-lg text-dark-400
                                       hover:text-dark-700 transition-colors">
                            {user.is_active
                              ? <XCircle size={13} className="text-red-400" />
                              : <CheckCircle size={13} className="text-green-400" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}