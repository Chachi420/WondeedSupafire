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

const ROLES: UserRole[] = ['client', 'clipper', 'admin']

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'admin')   return <span className="badge" style={{ background: '#1f2937', color: '#fff' }}>admin</span>
  if (role === 'client')  return <span className="badge badge-indigo">client</span>
  return <span className="badge badge-neutral">clipper</span>
}

function UserRowItem({ user: initial }: { user: UserRow }) {
  const [user, setUser]               = useState(initial)
  const [isPending, startTransition]  = useTransition()
  const [editRole, setEditRole]       = useState(false)
  const [topUpOpen, setTopUpOpen]     = useState(false)
  const [amount, setAmount]           = useState('')
  const [note, setNote]               = useState('')
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState<string | null>(null)

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
      <tr className={isPending ? 'opacity-60' : ''}>
        <td>
          <p className="med text-xs">{user.full_name ?? <span className="faint italic">No name</span>}</p>
          <p className="text-xs faint mt-4 mono">{user.phone ?? <span className="italic">email user</span>}</p>
        </td>
        <td>
          {editRole ? (
            <div className="row gap-4">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => changeRole(r)}
                  disabled={isPending}
                  className={`btn btn-sm ${r === user.role ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {r}
                </button>
              ))}
              <button onClick={() => setEditRole(false)} className="btn btn-sm btn-ghost">✕</button>
            </div>
          ) : (
            <button onClick={() => setEditRole(true)} className="row gap-8" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <RoleBadge role={user.role} />
              <span className="text-xs faint">edit</span>
            </button>
          )}
          {error && <p className="text-xs mt-4" style={{ color: 'var(--danger)' }}>{error}</p>}
        </td>
        <td>
          <p className="med text-xs">{user.wallets ? fmt(Number(user.wallets.balance_inr)) : '—'}</p>
          {success && <p className="text-xs mt-4" style={{ color: 'var(--success)' }}>{success}</p>}
        </td>
        <td className="text-xs muted">{user.wallets ? fmt(Number(user.wallets.total_credited_inr)) : '—'}</td>
        <td className="text-xs faint">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
        <td>
          {user.wallets ? (
            <button
              onClick={() => { setTopUpOpen(o => !o); setError(null); setSuccess(null) }}
              className="btn btn-sm btn-secondary"
            >
              {topUpOpen ? 'Cancel' : 'Top Up'}
            </button>
          ) : (
            <span className="text-xs faint">No wallet</span>
          )}
        </td>
      </tr>

      {topUpOpen && (
        <tr>
          <td colSpan={6} style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <div className="row gap-12" style={{ padding: '4px 0' }}>
              <span className="text-xs med" style={{ width: 120, flexShrink: 0 }}>
                Credit wallet for<br />
                <span style={{ fontWeight: 700 }}>{user.full_name ?? user.phone ?? user.id.slice(0, 8)}</span>
              </span>
              <div className="row gap-8" style={{ flex: 1 }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', fontSize: 13 }}>₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="input"
                    style={{ paddingLeft: 24, width: 120 }}
                  />
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleTopUp}
                  disabled={isPending || !amount}
                  className="btn btn-primary"
                >
                  {isPending ? 'Crediting…' : 'Credit'}
                </button>
              </div>
              {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
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
    <>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="segmented">
          {(['all', ...ROLES] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`seg-item${filter === f ? ' active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {f === 'all' ? `All (${users.length})` : `${f} (${users.filter(u => u.role === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px 28px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
          No users in this category
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Wallet Balance</th>
                <th>Total Credited</th>
                <th>Joined</th>
                <th>Wallet</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => <UserRowItem key={u.id} user={u} />)}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
