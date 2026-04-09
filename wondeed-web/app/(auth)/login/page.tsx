import PhoneOTPForm from '@/components/auth/PhoneOTPForm'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Wondeed</h1>
      <p className="text-sm text-gray-500 mb-8">Sign in with your phone number</p>
      <PhoneOTPForm />
    </div>
  )
}
