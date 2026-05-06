import PhoneOTPForm from '@/components/auth/PhoneOTPForm'

export default function LoginPage() {
  return (
    <div className="card" style={{ width: '100%', maxWidth: 380, padding: '32px 28px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Wondeed</h1>
      <p className="text-xs faint mb-20">Sign in with your phone number</p>
      <PhoneOTPForm />
    </div>
  )
}
