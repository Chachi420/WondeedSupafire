import OnboardForm from '@/components/auth/OnboardForm'

export default function OnboardPage() {
  return (
    <div className="auth-card">
      <h1 className="auth-card-title">You&apos;re almost there</h1>
      <p className="auth-card-sub">Choose how you want to use Wondeed to finish setting up your account.</p>
      <OnboardForm />
    </div>
  )
}
