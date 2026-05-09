import OnboardForm from '@/components/auth/OnboardForm'

export default function OnboardPage() {
  return (
    <div className="card" style={{ width: '100%', maxWidth: 400, padding: '36px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 17, color: '#0f172a',
          }}>W</div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Wondeed</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>You're almost there</h1>
        <p className="text-xs faint">Choose how you want to use Wondeed to finish setting up your account.</p>
      </div>
      <OnboardForm />
    </div>
  )
}
