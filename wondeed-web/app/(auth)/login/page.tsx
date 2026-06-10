import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="auth-card">
      <h1 className="auth-card-title">Welcome back</h1>
      <p className="auth-card-sub">Sign in to your Wondeed account</p>
      <LoginForm />
    </div>
  )
}
