import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="card" style={{ width: '100%', maxWidth: 400, padding: '36px 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 17, color: '#0f172a',
          }}>W</div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Wondeed</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create an account</h1>
        <p className="text-xs faint">Join India&apos;s performance-based clipping marketplace</p>
      </div>
      <SignupForm />
    </div>
  )
}
