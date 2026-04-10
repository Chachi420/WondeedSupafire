'use client'

import { useState, useTransition } from 'react'
import { updateUserRole, adminCreditWallet } from '@/app/dashboard/admin/actions'
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

function UserRow({ user: initial }: { user: UserRow }) {
  const [user, setUser]           = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [editRole, setEditRole]   = useState(false)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [amount, setAmount]       = useState('')
  const [note, setNote]           = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  function changeRole(newRole: UserRole) {
    if (newRole === user.role) { setEditRole(false); return }
    setError(null)
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole)
        setUser(u => ({ ...u, role: newRole }))
        setEditRole(false)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  function handleTopUp() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        await adminCreditWallet(user.id, amt, note)
        setUser(u => ({
          ...u,
          wallets: u.wallets
            ? {
                ...u.wallets,
                balance_inr:        Number(u.wallets.balance_inr)        + amt,
                total_credited_inr: Number(u.wallets.total_credited_inr) + amt,
              }
            : null,
        }))
        setSuccess(`Credited ${fmt(amt)}`)
        setAmount('')
        setNote('')
        setTopUpOpen(false)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isPending ? 'opacity-60' : ''}`}>
        {/* User */}
        <td className="px-5 py-4">
          <p className="text-sm font-medium text-gray-900">{user.full_name ?? <span className="text-gray-400 italic">No name</span>}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{user.phone ?? <span className="italic">email user</span>}</p>
        </td>

        {/* Role */}
        <td className="px-5 py-4">
          {editRole ? (
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
              <button onClick={() => setEditRole(false)} className="ml-1 text-xs text-gray-400 hover:text-gray-600">✕</button>
            </div>
          ) : (
            <button onClick={() => setEditRole(true)} className="group flex items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ROLE_STYLES[user.role]}`}>
                {user.role}
              </span>
              <span className="text-xs text-gray-300 group-hover:text-gray-500 transition-colors">edit</span>
            </button>
          )}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </td>

        {/* Wallet balance */}
        <td className="px-5 py-4">
          <p className="text-sm font-semibold text-gray-900 tabular-nums">
            {user.wallets ? fmt(Number(user.wallets.balance_inr)) : '—'}
          </p>
          {success && <p className="text-xs text-green-600 mt-0.5">{success}</p>}
        </td>

        {/* Total credited */}
        <td className="px-5 py-4 text-sm text-gray-500 tabular-nums">
          {user.wallets ? fmt(Number(user.wallets.total_credited_inr)) : '—'}
        </td>

        {/* Joined */}
        <td className="px-5 py-4 text-sm text-gray-400">
          {new Date(user.created_at).toLocaleDateString('en-IN')}
        </td>

        {/* Top-up action */}
        <td className="px-5 py-4">
          {user.wallets ? (
            <button
              onClick={() => { setTopUpOpen(o => !o); setError(null); setSuccess(null) }}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
            >
              {topUpOpen ? 'Cancel' : 'Top Up'}
            </button>
          ) : (
            <span className="text-xs text-gray-300">No wallet</span>
          )}
        </td>
      </tr>

      {/* Inline top-up form */}
      {topUpOpen && (
        <tr className="bg-indigo-50 border-b border-indigo-100">
          <td colSpan={6} className="px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-indigo-700 w-28 flex-shrink-0">
                Credit wallet for<br />
                <span className="font-semibold">{user.full_name ?? user.phone ?? user.id.slice(0, 8)}</span>
              </span>
              <div className="flex items-center gap-2 flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="pl-7 pr-3 py-1.5 border border-indigo-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="flex-1 px-3 py-1.5 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                <button
                  onClick={handleTopUp}
                  disabled={isPending || !amount}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Crediting…' : 'Credit'}
                </button>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          </td>
        </tr>
      )}
    </>
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Wallet</th>
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
