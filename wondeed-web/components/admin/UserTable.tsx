'use client'

import { useState, useTransition } from 'react'
import { updateUserRole } from '@/app/dashboard/admin/actions'
import type { UserRole } from '@/lib/types/database.types'

type UserRow = {
  id: string
  phone: string | null
  full_name: string | null
  role: UserRole
  created_at: string
  wallets: { balance_inr: number; total_credited_inr: number; total_debited_inr: number } | null
}

const ROLE_STYLES: Record<UserRole, string> = {
  client:  'bg-indigo-100 text-indigo-700',
  clipper: 'bg-teal-100 text-teal-700',
  admin:   'bg-gray-800 text-white',
}

const ROLES: UserRole[] = ['client', 'clipper', 'admin']

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function UserRow({ user }: { user: UserRow }) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing]        = useState(false)
  const [error, setError]            = useState<string | null>(null)

  function changeRole(newRole: UserRole) {
    if (newRole === user.role) { setEditing(false); return }
    setError(null)
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole)
        setEditing(false)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${isPending ? 'opacity-50' : ''}`}>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-gray-900">{user.full_name ?? <span className="text-gray-400 italic">No name</span>}</p>
        <p className="text-xs text-gray-400 mt-0.5 font-mono">{user.phone ?? <span className="italic">email user</span>}</p>
      </td>
      <td className="px-5 py-4">
        {editing ? (
          <div className="flex items-center gap-1">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => changeRole(r)}
                disabled={isPending}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  r === user.role
                    ? ROLE_STYLES[r] + ' border-transparent'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {r}
              </button>
            ))}
            <button onClick={() => setEditing(false)} className="ml-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="group flex items-center gap-2">
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ROLE_STYLES[user.role]}`}>
              {user.role}
            </span>
            <span className="text-xs text-gray-300 group-hover:text-gray-500 transition-colors">edit</span>
          </button>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </td>
      <td className="px-5 py-4 text-sm text-gray-900 tabular-nums">
        {user.wallets ? fmt(Number(user.wallets.balance_inr)) : '—'}
      </td>
      <td className="px-5 py-4 text-sm text-gray-500 tabular-nums">
        {user.wallets ? fmt(Number(user.wallets.total_credited_inr)) : '—'}
      </td>
      <td className="px-5 py-4 text-sm text-gray-400">
        {new Date(user.created_at).toLocaleDateString('en-IN')}
      </td>
    </tr>
  )
}

export default function UserTable({ users }: { users: UserRow[] }) {
  const [filter, setFilter] = useState<UserRole | 'all'>('all')

  const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', ...ROLES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {f === 'all' ? `All (${users.length})` : `${f} (${users.filter(u => u.role === f).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0
          ? <p className="p-10 text-sm text-gray-400 text-center">No users in this category</p>
          : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Wallet Balance</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Credited</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => <UserRow key={u.id} user={u} />)}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  )
}
