// Middleware handles redirect: authed users → dashboard, guests → /login
// This page is only rendered for guests on '/' who haven't been redirected yet
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}
