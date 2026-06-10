import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="auth-card">
      <h1 className="auth-card-title">Create your account</h1>
      <p className="auth-card-sub">Join India&apos;s performance-based clipping marketplace</p>
      <SignupForm />
    </div>
  )
}
