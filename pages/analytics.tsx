import Layout from '../components/layout/Layout'
import PageHeader from '../components/ui/PageHeader'
import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <Layout title="Analytics">
      <PageHeader
        title="Analytics"
        subtitle="Advanced audit analytics — coming soon"
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      />
      <div style={{
        background: 'white', borderRadius: '1rem',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        border: '1px solid #ebebeb', padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ color: '#1a1a2e', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Analytics Dashboard
        </h2>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          Advanced reporting and analytics features are coming soon.
        </p>
        <Link href="/dashboard" style={{
          display: 'inline-flex',
          background: 'linear-gradient(135deg,#c9a227,#a8841d)',
          color: 'white', padding: '0.75rem 1.5rem',
          borderRadius: '0.625rem', textDecoration: 'none',
          fontWeight: '600', fontSize: '0.875rem',
        }}>← Back to Dashboard</Link>
      </div>
    </Layout>
  )
}